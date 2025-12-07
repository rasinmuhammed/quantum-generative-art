"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                           THE QUANTUM CANVAS                                 ║
║                                                                              ║
║   Transform names into quantum universes through parametric circuits.       ║
║   Every name becomes a unique probability distribution—a fingerprint        ║
║   written in the language of quantum mechanics.                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

This module implements a quantum art generator using the EfficientSU2 ansatz.
It supports both local simulation via Qiskit Aer and cloud execution on
IBM Quantum hardware.

The mathematical foundation:
    U(θ) = ∏_{d=1}^{D} (U_ent ∏_{i=1}^{n} RY(θ_i) RZ(θ_i))

Where each rotation angle θ is deterministically derived from the input name
through SHA-256 hashing, ensuring the same name always produces the same art.

Author: Muhammed Rasin
License: MIT
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Any

import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import EfficientSU2
from qiskit_aer import AerSimulator

from .utils import hash_name_to_seed, seed_to_parameters


# ════════════════════════════════════════════════════════════════════════════
# Configuration
# ════════════════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class QuantumConfig:
    """
    Circuit configuration for quantum art generation.
    
    These defaults are optimized for IBM Quantum's free tier:
    - 5 qubits: fits on any IBM processor
    - 3 layers: sufficient expressibility without excessive depth
    - 100 shots: preserves quantum grain while conserving quota
    """
    num_qubits: int = 5
    layers: int = 3
    shots: int = 100
    
    @property
    def num_parameters(self) -> int:
        """Total rotation angles: (layers + 1) × qubits × 2"""
        return (self.layers + 1) * self.num_qubits * 2
    
    @property
    def max_states(self) -> int:
        """Maximum possible basis states: 2^n"""
        return 2 ** self.num_qubits


DEFAULT_CONFIG = QuantumConfig()


# ════════════════════════════════════════════════════════════════════════════
# Data Classes
# ════════════════════════════════════════════════════════════════════════════

@dataclass
class ArtResult:
    """
    The outcome of a quantum art generation.
    
    Contains the probability distribution that defines a unique
    visual universe—the quantum fingerprint of an identity.
    """
    name: str
    seed: int
    counts: Dict[str, int]
    config: QuantumConfig
    backend_name: str
    
    @property
    def total_shots(self) -> int:
        return sum(self.counts.values())
    
    @property
    def num_states(self) -> int:
        return len(self.counts)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "seed": self.seed,
            "counts": self.counts,
            "total_shots": self.total_shots,
            "num_states": self.num_states,
            "backend": self.backend_name,
            "config": {
                "num_qubits": self.config.num_qubits,
                "layers": self.config.layers,
                "shots": self.config.shots
            }
        }
    
    def to_frontend_json(self) -> Dict[str, int]:
        return self.counts


# ════════════════════════════════════════════════════════════════════════════
# QuantumCanvas: The Heart of the System
# ════════════════════════════════════════════════════════════════════════════

class QuantumCanvas:
    """
    Transform names into quantum probability distributions.
    
    This class orchestrates the entire pipeline:
    1. Name → deterministic seed via SHA-256
    2. Seed → rotation angles uniformly distributed in [0, 2π]
    3. Angles → parameterized EfficientSU2 circuit
    4. Circuit → measurement counts (the quantum fingerprint)
    
    Example:
        >>> canvas = QuantumCanvas()
        >>> result = canvas.generate_art("Muhammed Rasin")
        >>> print(f"Your universe contains {result.num_states} quantum states")
    """
    
    def __init__(
        self,
        config: Optional[QuantumConfig] = None,
        use_cloud: bool = False
    ) -> None:
        self.config = config or DEFAULT_CONFIG
        self.use_cloud = use_cloud
        self._service = None
        self._backend = None
        
    @property
    def backend(self):
        if self._backend is None:
            self._backend = self._initialize_backend()
        return self._backend
    
    def _initialize_backend(self):
        if self.use_cloud:
            from qiskit_ibm_runtime import QiskitRuntimeService
            
            print("🔗 Connecting to IBM Quantum...")
            self._service = QiskitRuntimeService()
            backend = self._service.least_busy(operational=True, simulator=False)
            print(f"✓ Selected: {backend.name}")
            return backend
        else:
            print("🖥️  Using local AerSimulator")
            return AerSimulator()
    
    def _build_ansatz(self) -> EfficientSU2:
        """Construct the variational ansatz."""
        return EfficientSU2(
            num_qubits=self.config.num_qubits,
            su2_gates=['ry', 'rz'],
            entanglement='full',
            reps=self.config.layers
        )
    
    def _build_circuit(self, parameters: np.ndarray) -> QuantumCircuit:
        ansatz = self._build_ansatz()
        
        if len(parameters) != ansatz.num_parameters:
            raise ValueError(
                f"Expected {ansatz.num_parameters} parameters, got {len(parameters)}"
            )
        
        circuit = ansatz.assign_parameters(parameters)
        circuit.measure_all()
        return circuit
    
    def generate_art(self, user_name: str) -> ArtResult:
        """
        Generate a quantum fingerprint for a name.
        
        The same name will always produce the same art—
        a deterministic window into quantum probability space.
        """
        print(f"\n🎨 Generating art for: '{user_name}'")
        
        seed = hash_name_to_seed(user_name)
        parameters = seed_to_parameters(seed, self.config.num_parameters)
        
        print(f"   Seed: {seed}")
        print(f"   Parameters: {self.config.num_parameters}")
        
        circuit = self._build_circuit(parameters)
        transpiled = transpile(circuit, backend=self.backend, optimization_level=3)
        
        print(f"   Executing on {self.backend.name} ({self.config.shots} shots)...")
        counts = self._execute_circuit(transpiled)
        
        print(f"   ✓ Generated {len(counts)} unique quantum states")
        
        return ArtResult(
            name=user_name,
            seed=seed,
            counts=counts,
            config=self.config,
            backend_name=self.backend.name
        )
    
    def generate_art_batch(self, names: List[str]) -> List[ArtResult]:
        """Generate art for multiple names in a single batch job."""
        if not names:
            raise ValueError("Names list cannot be empty")
        
        print(f"\n🎨 Batch generating art for {len(names)} names...")
        
        circuits = []
        metadata = []
        
        for name in names:
            seed = hash_name_to_seed(name)
            params = seed_to_parameters(seed, self.config.num_parameters)
            circuit = self._build_circuit(params)
            
            circuits.append(circuit)
            metadata.append({"name": name, "seed": seed})
            print(f"   Prepared: {name}")
        
        print(f"   Transpiling {len(circuits)} circuits...")
        transpiled = transpile(circuits, backend=self.backend, optimization_level=3)
        
        print(f"   Executing batch on {self.backend.name}...")
        all_counts = self._execute_circuits_batch(transpiled)
        
        results = []
        for i, counts in enumerate(all_counts):
            result = ArtResult(
                name=metadata[i]["name"],
                seed=metadata[i]["seed"],
                counts=counts,
                config=self.config,
                backend_name=self.backend.name
            )
            results.append(result)
            print(f"   ✓ {result.name}: {result.num_states} states")
        
        print(f"   ✓ Batch complete!")
        return results
    
    def _execute_circuit(self, circuit: QuantumCircuit) -> Dict[str, int]:
        if self.use_cloud:
            return self._execute_cloud([circuit])[0]
        else:
            return self._execute_local([circuit])[0]
    
    def _execute_circuits_batch(self, circuits: List[QuantumCircuit]) -> List[Dict[str, int]]:
        if self.use_cloud:
            return self._execute_cloud(circuits)
        else:
            return self._execute_local(circuits)
    
    def _execute_local(self, circuits: List[QuantumCircuit]) -> List[Dict[str, int]]:
        results = []
        for circuit in circuits:
            job = self.backend.run(circuit, shots=self.config.shots)
            result = job.result()
            counts = result.get_counts(circuit)
            results.append(counts)
        return results
    
    def _execute_cloud(self, circuits: List[QuantumCircuit]) -> List[Dict[str, int]]:
        from qiskit_ibm_runtime import SamplerV2 as Sampler
        
        sampler = Sampler(mode=self.backend)
        job = sampler.run(circuits, shots=self.config.shots)
        print(f"   Job ID: {job.job_id()}")
        print(f"   Waiting for results...")
        
        result = job.result()
        
        all_counts = []
        for i in range(len(circuits)):
            counts = result[i].data.meas.get_counts()
            all_counts.append(counts)
        
        return all_counts
    
    def export_hardware_map(self, output_path: Optional[str] = None) -> Optional[str]:
        """Export quantum processor topology as proof of execution."""
        if not self.use_cloud:
            print("⚠️  Hardware map only available for cloud backends")
            return None
        
        from qiskit.visualization import plot_gate_map
        
        output_path = output_path or "output/hardware_map.png"
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        fig = plot_gate_map(self.backend)
        fig.savefig(output_path, dpi=150, bbox_inches='tight')
        
        print(f"✓ Hardware map saved: {output_path}")
        return output_path
    
    def save_result(
        self,
        result: ArtResult,
        output_path: Optional[str] = None,
        full_metadata: bool = False
    ) -> str:
        output_path = output_path or "web/quantum_data.json"
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        data = result.to_dict() if full_metadata else result.to_frontend_json()
        
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        abs_path = str(Path(output_path).absolute())
        print(f"✓ Saved: {abs_path}")
        return abs_path


# ════════════════════════════════════════════════════════════════════════════
# Command Line Interface
# ════════════════════════════════════════════════════════════════════════════

def main() -> None:
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Generate quantum art from a name",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m src.quantum_canvas "Muhammed Rasin"
  python -m src.quantum_canvas --batch "Alice" "Bob" "Charlie"
  python -m src.quantum_canvas --cloud "Muhammed Rasin"
        """
    )
    
    parser.add_argument("names", nargs="+", help="Name(s) to generate art for")
    parser.add_argument("--cloud", action="store_true", help="Use IBM Quantum cloud")
    parser.add_argument("--batch", action="store_true", help="Batch execution mode")
    parser.add_argument("--output", default="web/quantum_data.json", help="Output path")
    parser.add_argument("--full-meta", action="store_true", help="Include full metadata")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("  THE QUANTUM CANVAS")
    print("  Your Name → Quantum Fingerprint → Unique Universe")
    print("=" * 60)
    print(f"  Mode: {'IBM Quantum Cloud' if args.cloud else 'Local Simulator'}")
    print(f"  Names: {', '.join(args.names)}")
    print("=" * 60)
    
    canvas = QuantumCanvas(use_cloud=args.cloud)
    
    if args.batch and len(args.names) > 1:
        results = canvas.generate_art_batch(args.names)
        result = results[0]
    else:
        result = canvas.generate_art(args.names[0])
    
    canvas.save_result(result, args.output, full_metadata=args.full_meta)
    
    if args.cloud:
        canvas.export_hardware_map()
    
    print("\n" + "=" * 60)
    print("  ✓ COMPLETE!")
    print("  Open web/index.html to view your quantum art")
    print("=" * 60)


if __name__ == "__main__":
    main()
