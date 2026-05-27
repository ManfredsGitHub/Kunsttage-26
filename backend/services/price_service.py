import math


def berechne_verkaufspreis(einlieferungspreis: float) -> float:
    """Einlieferungspreis × 1,80, aufgerundet auf nächste 10€."""
    rohpreis = einlieferungspreis * 1.80
    return math.ceil(rohpreis / 10) * 10
