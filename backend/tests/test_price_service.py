import pytest
from services.price_service import berechne_verkaufspreis


@pytest.mark.parametrize("einlieferung, erwartet", [
    (100.0,  180.0),   # 100 × 1,8 = 180 → exakt auf 10
    (101.0,  190.0),   # 101 × 1,8 = 181,8 → Aufrundung auf 190
    (50.0,    90.0),   # 50  × 1,8 = 90 → exakt
    (55.0,   100.0),   # 55  × 1,8 = 99 → Aufrundung auf 100
    (10.0,    20.0),   # 10  × 1,8 = 18 → Aufrundung auf 20
    (1000.0, 1800.0),  # 1000 × 1,8 = 1800 → exakt
    (333.0,  600.0),   # 333 × 1,8 = 599,4 → Aufrundung auf 600
    (0.01,    10.0),   # Kleinstbetrag → mindestens 10€
])
def test_berechne_verkaufspreis(einlieferung: float, erwartet: float):
    assert berechne_verkaufspreis(einlieferung) == erwartet


def test_ergebnis_immer_vielfaches_von_10():
    for i in range(1, 200):
        preis = berechne_verkaufspreis(float(i))
        assert preis % 10 == 0, f"Preis {preis} für Einlieferung {i} ist kein Vielfaches von 10"


def test_verkaufspreis_mindestens_einlieferungspreis():
    for i in range(1, 200):
        vk = berechne_verkaufspreis(float(i))
        assert vk >= i, f"Verkaufspreis {vk} liegt unter Einlieferungspreis {i}"
