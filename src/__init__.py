"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                         THE QUANTUM CANVAS                                   ║
║                                                                              ║
║   A quantum art generator using parametric quantum circuits.                 ║
║   Transform any name into a unique, deterministic universe.                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

Author: Muhammed Rasin
License: MIT
"""

from .quantum_canvas import QuantumCanvas, QuantumConfig, ArtResult, DEFAULT_CONFIG
from .utils import (
    hash_name_to_seed,
    seed_to_parameters,
    hamming_weight,
    bitstring_to_int,
    calculate_probability
)

__version__ = "1.0.0"
__author__ = "Muhammed Rasin"

__all__ = [
    "QuantumCanvas",
    "QuantumConfig",
    "ArtResult",
    "DEFAULT_CONFIG",
    "hash_name_to_seed",
    "seed_to_parameters",
    "hamming_weight",
    "bitstring_to_int",
    "calculate_probability",
]
