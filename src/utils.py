"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                     QUANTUM CANVAS UTILITIES                                 ║
║                                                                              ║
║   Helper functions for deterministic parameter generation.                   ║
║   Names become seeds; seeds become quantum rotation angles.                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import hashlib
import numpy as np
from typing import Tuple


def hash_name_to_seed(name: str) -> int:
    """
    Transform a name into a deterministic integer seed.
    
    Uses SHA-256 to create a consistent fingerprint that seeds
    the random number generator for parameter generation.
    
    The same name will always yield the same seed, ensuring
    reproducibility across runs and platforms.
    """
    if not name or not name.strip():
        raise ValueError("Name cannot be empty")
    
    normalized = name.strip().lower()
    hash_bytes = hashlib.sha256(normalized.encode('utf-8')).digest()
    seed = int.from_bytes(hash_bytes[:4], byteorder='big')
    
    return seed


def seed_to_parameters(seed: int, num_params: int) -> np.ndarray:
    """
    Generate rotation angles from a seed.
    
    Creates an array of angles uniformly distributed in [0, 2π]
    that will parameterize the quantum circuit's rotation gates.
    
    These angles encode the unique identity of the input name
    into the quantum circuit's structure.
    """
    rng = np.random.default_rng(seed)
    return rng.uniform(0, 2 * np.pi, num_params)


def bitstring_to_int(bitstring: str) -> int:
    """Convert a binary string to its integer value."""
    return int(bitstring, 2)


def hamming_weight(bitstring: str) -> int:
    """
    Count the number of 1s in a bitstring.
    
    In quantum mechanics, this represents the excitation level
    of the computational basis state—how many qubits are in |1⟩.
    """
    return bitstring.count('1')


def calculate_probability(count: int, total_shots: int) -> float:
    """Calculate the empirical probability of a measurement outcome."""
    return count / total_shots if total_shots > 0 else 0.0
