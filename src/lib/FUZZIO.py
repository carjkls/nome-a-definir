"""
FUZZIO v2.0 — Dashboard de Decisão Quantitativa e Risco Fuzzy
=============================================================
Arquivo único — basta executar:  streamlit run fuzzio.py

Autor : Lucas Menezes · UNESP
Motor : scikit-fuzzy  |  Dados: Yahoo Finance
"""

# ─────────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────────
import numpy as np
import pandas as pd
import skfuzzy as fuzzy
from skfuzzy import control as ctrl
import yfinance as yf
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import streamlit as st
from datetime import date
from dataclasses import dataclass


# ─────────────────────────────────────────────
# MÓDULO DE DADOS
# ─────────────────────────────────────────────
def carregar_dados(ticker: str, data_inicio, data_fim) -> pd.DataFrame:
    """
    Baixa dados históricos e calcula retornos e volatilidade móvel.

    Parâmetros
    ----------
    ticker : str
        Código do ativo (ex: 'PETR4.SA', 'AAPL').
    data_inicio : date
        Início do período de análise.
    data_fim : date
        Fim do período de análise.

    Retorna
    -------
    pd.DataFrame
        Colunas: Close, Retornos, VolMovel — sem NaN.

    Raises
    ------
    ValueError
        Ticker inválido, sem dados ou período insuficiente.
    """
    if not ticker or not ticker.strip():
        raise ValueError("O ticker não pode estar vazio.")

    # Buffer de 3 meses para garantir janela rolling completa
    inicio_buffer = pd.to_datetime(data_inicio) - pd.DateOffset(months=3)

    df = yf.download(
        ticker,
        start=inicio_buffer,
        end=data_fim,
        auto_adjust=True,
        progress=False,
    )

    if df is None or df.empty:
        raise ValueError(f"Nenhum dado encontrado para '{ticker}'. Verifique o ticker.")

    # Normaliza MultiIndex retornado por versões recentes do yfinance
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    if "Close" not in df.columns:
        raise ValueError(f"Coluna 'Close' não encontrada para '{ticker}'.")

    # Indicadores
    df["Retornos"] = np.log(df["Close"] / df["Close"].shift(1))
    df["VolMovel"] = (
                         df["Retornos"]
                         .rolling(21)
                         .std()
                         .ewm(span=10)
                         .mean()
                     ) * 100 * np.sqrt(252)

    # Filtra pelo período solicitado
    df = df.loc[str(data_inicio): str(data_fim)].dropna().copy()

    if len(df) < 10:
        raise ValueError(
            f"Dados insuficientes para '{ticker}' no período selecionado "
            f"({len(df)} observações). Amplie o intervalo de datas."
        )

    return df


# ─────────────────────────────────────────────
# MÓDULO FUZZY
# ─────────────────────────────────────────────
@dataclass
class ResultadoFuzzy:
    """
    Resultado do processamento fuzzy para uma série temporal.

    Atributos
    ----------
    riscos : np.ndarray
        Série de risco fuzzy suavizada (0–100).
    risco_atual : float
        Último valor calculado.
    hho_gate : float
        Gatilho de crise (percentil 75 × sigma).
    v_max : float
        Teto do universo fuzzy.
    """
    riscos: np.ndarray
    risco_atual: float
    hho_gate: float
    v_max: float


def _construir_sistema(hho_gate: float, v_max: float) -> ctrl.ControlSystemSimulation:
    """
    Constrói o sistema fuzzy com universo dinâmico.

    Parâmetros
    ----------
    hho_gate : float
        Limiar de crise.
    v_max : float
        Teto do universo de volatilidade.

    Retorna
    -------
    ctrl.ControlSystemSimulation
        Simulação pronta para receber inputs.
    """
    v_in = ctrl.Antecedent(np.arange(0, v_max + 1, 0.1), "volatilidade")
    r_out = ctrl.Consequent(np.arange(0, 101, 1), "risco")

    # sorted() garante a <= b <= c <= d (evita AssertionError)
    v_in["baixo"] = fuzzy.trapmf(
        v_in.universe,
        sorted([0, 0, hho_gate * 0.4, hho_gate * 0.75]),
    )
    v_in["moderado"] = fuzzy.trimf(
        v_in.universe,
        sorted([hho_gate * 0.7, hho_gate, hho_gate * 1.3]),
    )
    v_in["critico"] = fuzzy.trapmf(
        v_in.universe,
        sorted([hho_gate * 1.1, v_max * 0.7, v_max, v_max]),
    )

    r_out["seguro"] = fuzzy.trimf(r_out.universe, [0, 0, 40])
    r_out["alerta"] = fuzzy.trimf(r_out.universe, [30, 50, 70])
    r_out["critico"] = fuzzy.trimf(r_out.universe, [60, 100, 100])

    sistema = ctrl.ControlSystem([
        ctrl.Rule(v_in["baixo"], r_out["seguro"]),
        ctrl.Rule(v_in["moderado"], r_out["alerta"]),
        ctrl.Rule(v_in["critico"], r_out["critico"]),
    ])

    return ctrl.ControlSystemSimulation(sistema)


def calcular_risco(vol_series: pd.Series, sigma: float = 1.2) -> ResultadoFuzzy:
    """
    Processa uma série de volatilidades e retorna riscos fuzzy suavizados.

    Usa np.vectorize para performance superior ao loop Python puro.
    A série final é suavizada com EWM (span=8) para reduzir ruído.

    Parâmetros
    ----------
    vol_series : pd.Series
        Volatilidade móvel anualizada (%).
    sigma : float
        Fator de sensibilidade do gatilho HHO. Padrão: 1.2.

    Retorna
    -------
    ResultadoFuzzy
        Dataclass com riscos, risco_atual, hho_gate e v_max.

    Raises
    ------
    ValueError
        Se a série estiver vazia.
    """
    if vol_series.dropna().empty:
        raise ValueError("A série de volatilidade está vazia.")

    hho_base = np.percentile(vol_series, 75)
    hho_gate = hho_base * sigma
    v_max = max(vol_series.max() * 1.5, hho_gate * 2)

    sim = _construir_sistema(hho_gate, v_max)

    def _inferir(vol: float) -> float:
        sim.input["volatilidade"] = np.clip(vol, 0, v_max)
        sim.compute()
        return sim.output["risco"]

    # Vetorização — evita overhead do loop Python puro
    riscos_brutos = np.vectorize(_inferir)(vol_series.values)

    riscos_suavizados = (
        pd.Series(riscos_brutos)
        .ewm(span=8)
        .mean()
        .values
    )

    return ResultadoFuzzy(
        riscos=riscos_suavizados,
        risco_atual=float(riscos_suavizados[-1]),
        hho_gate=hho_gate,
        v_max=v_max,
    )


# ─────────────────────────────────────────────
# HELPERS DE UI
# ─────────────────────────────────────────────
def _zona_risco(r: float) -> tuple:
    """Retorna (emoji, label, cor_hex) com base no valor de risco."""
    if r >= 75:
        return "🔴", "CRÍTICO", "#FF4B4B"
    if r >= 40:
        return "🟡", "ALERTA", "#FFD700"
    return "🟢", "SEGURO", "#4CAF82"


# ─────────────────────────────────────────────
# CONFIGURAÇÃO DA PÁGINA
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="FUZZIO | Research Dashboard",
    page_icon="🛡️",
    layout="wide",
)

st.markdown("""
<style>
.stApp { background-color: #0A0A0F; }

h1, h2, h3, p, span, label,
div[data-testid="stMarkdownContainer"] p { color: #E8E8F0 !important; }

[data-testid="stMetricValue"]  { color: #7EB8A4 !important; font-size: 1.6rem !important; }
[data-testid="stMetricLabel"]  { color: #666680 !important; font-size: 0.78rem !important; letter-spacing: 0.06em; }
div[data-testid="metric-container"] {
    background: linear-gradient(135deg, #13131F 0%, #0F0F1A 100%);
    border: 1px solid #2A2A40;
    padding: 1.2rem 1.4rem;
    border-radius: 14px;
}

[data-testid="stSidebar"] { background-color: #0D0D18 !important; border-right: 1px solid #1E1E30; }
[data-testid="stSidebar"] label { color: #9090B0 !important; font-size: 0.82rem; }

input, .stTextInput input {
    background-color: #13131F !important;
    border: 1px solid #2A2A42 !important;
    color: #E8E8F0 !important;
    border-radius: 8px !important;
}

[data-testid="stSlider"] > div > div > div > div { background: #7EB8A4 !important; }

hr { border-color: #1E1E30 !important; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0A0A0F; }
::-webkit-scrollbar-thumb { background: #2A2A42; border-radius: 3px; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# CABEÇALHO
# ─────────────────────────────────────────────
col_title, col_badge = st.columns([5, 1])
with col_title:
    st.markdown("# 🛡️ FUZZIO")
    st.markdown(
        "<p style='color:#666680; font-size:0.9rem; margin-top:-12px;'>"
        "Dashboard de Decisão Quantitativa e Risco Fuzzy</p>",
        unsafe_allow_html=True,
    )
with col_badge:
    st.markdown(
        "<div style='text-align:right; padding-top:18px;'>"
        "<span style='background:#1A1A2E; border:1px solid #2A2A42; border-radius:8px; "
        "padding:4px 10px; font-size:0.72rem; color:#666680;'>v2.0 · UNESP</span></div>",
        unsafe_allow_html=True,
    )

# ─────────────────────────────────────────────
# SIDEBAR
# ─────────────────────────────────────────────
with st.sidebar:
    st.markdown("### ⚙️ Parâmetros")
    st.markdown("<hr style='margin:8px 0 16px'>", unsafe_allow_html=True)

    ticker = st.text_input(
        "Ativo",
        value="PETR4.SA",
        help="Ex: PETR4.SA, VALE3.SA, AAPL, BTC-USD",
    ).upper().strip()

    data_inicio = st.date_input("Data de início", value=date(2020, 1, 1))
    data_fim = st.date_input("Data de fim", value=date(2026, 3, 27))

    sigma = st.slider(
        "Sensibilidade (Sigma)",
        min_value=0.5,
        max_value=2.0,
        value=1.2,
        step=0.05,
        help="Multiplica o gatilho HHO. Valores maiores = sistema menos sensível.",
    )

    st.markdown("<hr style='margin:16px 0 8px'>", unsafe_allow_html=True)
    st.markdown(
        "<p style='font-size:0.75rem; color:#444460;'>"
        "🟥 Crítico ≥ 75 &nbsp;|&nbsp; 🟨 Alerta ≥ 40 &nbsp;|&nbsp; 🟩 Seguro &lt; 40</p>",
        unsafe_allow_html=True,
    )

# ─────────────────────────────────────────────
# VALIDAÇÕES
# ─────────────────────────────────────────────
if not ticker:
    st.warning("⚠️ Insira um ticker válido na barra lateral.")
    st.stop()

if data_inicio >= data_fim:
    st.error("❌ A data de início deve ser anterior à data de fim.")
    st.stop()


# ─────────────────────────────────────────────
# CARREGAMENTO DE DADOS
# ─────────────────────────────────────────────
@st.cache_data(show_spinner=False)
def _carregar(ticker, inicio, fim):
    """Wrapper cacheável para carregar_dados()."""
    return carregar_dados(ticker, inicio, fim)


with st.spinner(f"Carregando dados de **{ticker}**..."):
    try:
        df = _carregar(ticker, data_inicio, data_fim)
    except ValueError as e:
        st.error(f"❌ {e}")
        st.stop()
    except Exception as e:
        st.error(f"❌ Erro inesperado ao carregar dados: {e}")
        st.stop()

# ─────────────────────────────────────────────
# CÁLCULO FUZZY
# ─────────────────────────────────────────────
with st.spinner("Calculando risco fuzzy..."):
    try:
        resultado = calcular_risco(df["VolMovel"], sigma=sigma)
    except ValueError as e:
        st.error(f"❌ Erro no motor fuzzy: {e}")
        st.stop()
    except Exception as e:
        st.error(f"❌ Erro inesperado no cálculo: {e}")
        st.stop()

riscos = resultado.riscos
risco_atual = resultado.risco_atual
hho_gate = resultado.hho_gate
emoji_risco, label_risco, cor_risco = _zona_risco(risco_atual)

# ─────────────────────────────────────────────
# MÉTRICAS
# ─────────────────────────────────────────────
st.markdown("---")
m1, m2, m3, m4, m5 = st.columns(5)
m1.metric("Ativo", ticker)
m2.metric("Risco Atual", f"{risco_atual:.1f}%")
m3.metric("Zona", f"{emoji_risco} {label_risco}")
m4.metric("Vol Média", f"{df['VolMovel'].mean():.2f}%")
m5.metric("Gatilho HHO", f"{hho_gate:.2f}%")

# ─────────────────────────────────────────────
# GRÁFICO
# ─────────────────────────────────────────────
plt.style.use("dark_background")

fig, (ax1, ax2) = plt.subplots(
    2, 1,
    figsize=(13, 9),
    sharex=True,
    gridspec_kw={"height_ratios": [1.6, 1], "hspace": 0.06},
)
BG = "#0A0A0F"
fig.patch.set_facecolor(BG)

for ax in (ax1, ax2):
    ax.set_facecolor("#0D0D1A")
    ax.tick_params(colors="#555570", labelsize=9)
    ax.spines[:].set_color("#1E1E30")
    ax.yaxis.set_minor_locator(mticker.AutoMinorLocator())
    ax.grid(axis="y", color="#1A1A28", linewidth=0.5, linestyle="--")
    ax.grid(axis="x", color="#141420", linewidth=0.4)

# Preço
ax1.plot(df.index, df["Close"], color="#A0C4FF", lw=1.4)
ax1.fill_between(df.index, df["Close"], df["Close"].min(), alpha=0.06, color="#A0C4FF")
ax1.set_ylabel("Preço (R$)", color="#666680", fontsize=9)
ax1.yaxis.set_label_coords(-0.055, 0.5)

# Risco fuzzy
ax2.plot(df.index, riscos, color="#E8E8F0", lw=0.7, alpha=0.5)
ax2.fill_between(df.index, 0, riscos,
                 where=(riscos < 40),
                 color="#4CAF82", alpha=0.35, label="Seguro")
ax2.fill_between(df.index, 0, riscos,
                 where=(riscos >= 40) & (riscos < 75),
                 color="#FFD700", alpha=0.30, label="Alerta")
ax2.fill_between(df.index, 0, riscos,
                 where=(riscos >= 75),
                 color="#FF4B4B", alpha=0.45, label="Crítico")

ax2.axhline(y=75, color="#FF4B4B", linestyle="--", lw=1.2, alpha=0.7)
ax2.axhline(y=40, color="#FFD700", linestyle=":", lw=1.0, alpha=0.6)
ax2.set_ylabel("Risco Fuzzy (%)", color="#666680", fontsize=9)
ax2.set_ylim(0, 108)
ax2.yaxis.set_label_coords(-0.055, 0.5)

ax2.annotate(
    f" {risco_atual:.1f}%",
    xy=(df.index[-1], risco_atual),
    fontsize=8.5,
    color=cor_risco,
    va="center",
)

ax2.legend(
    loc="upper left",
    fontsize=8,
    framealpha=0.15,
    edgecolor="#2A2A42",
    labelcolor="#A0A0C0",
)

fig.text(
    0.5, -0.01,
    "FUZZIO · Lucas Menezes · UNESP",
    ha="center", fontsize=8, color="#333350",
)

st.pyplot(fig)
plt.close(fig)

# ─────────────────────────────────────────────
# RODAPÉ
# ─────────────────────────────────────────────
st.markdown("---")
st.markdown(
    "<div style='text-align:center; color:#2E2E50; font-size:11px; padding-bottom:8px;'>"
    "FUZZIO · Lucas Menezes · UNESP &nbsp;·&nbsp; "
    "Dados: Yahoo Finance &nbsp;·&nbsp; Motor: scikit-fuzzy"
    "</div>",
    unsafe_allow_html=True,
)