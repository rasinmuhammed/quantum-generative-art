# Theoretical Foundation

## Parametric Quantum Circuits

This project uses a **Parametric Quantum Circuit** (PQC) based on the **EfficientSU2** ansatz. The circuit transforms an initial ground state into a complex superposition determined by 40 rotation angles derived from the user's name.

## Circuit Formulation

The quantum circuit implements:

$$U(\vec{\theta}) = \prod_{d=1}^{D} \left(U_{ent} \prod_{i=1}^{n} R_y(\theta_{d,i}^y) R_z(\theta_{d,i}^z) \right)$$

Where:
- D = 3 layers
- n = 5 qubits
- U_ent = entangling layer (CNOT gates)
- R_y, R_z = rotation gates

## Rotation Gates

$$R_y(\theta) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

$$R_z(\theta) = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}$$

## Parameter Count

For 5 qubits and 3 layers:
- Parameters = (D + 1) × n × 2 = 4 × 5 × 2 = **40 angles**

## Deterministic Seeding

```
Name → SHA-256 → seed (mod 2³²) → 40 angles ∈ [0, 2π]
```

Same name always produces identical parameters.

---

## Visualization Mapping

Every visual element derives from quantum physics:

### 1. Orbital Shells = Hamming Weight (Energy)

$$n = H(x) = \sum_{i=0}^{4} x_i$$

States with more 1-bits orbit in higher shells, analogous to electron energy levels.

### 2. Orbital Speed = Kepler-like Period

$$T \propto \frac{1}{n+1}$$

Ground state (n=0) orbits slowest. Higher energy states move faster.

### 3. Orb Size = Probability Amplitude

$$\text{size} \propto \sqrt{P(x)} = |\langle x | \psi \rangle|$$

The amplitude (not probability) determines visual size.

### 4. Glow Intensity = Measurement Probability

$$\text{glow} \propto P(x) = |\langle x | \psi \rangle|^2$$

More probable states glow brighter.

### 5. Color Hue = Hilbert Space Phase

$$\text{hue} = 2\pi \times \frac{\text{state value}}{2^n}$$

Position in the computational basis maps to color wheel position.

### 6. Color Saturation = Parity

$$\text{parity} = H(x) \mod 2$$

Even-parity states have higher saturation than odd-parity states.

### 7. Connection Lines = Bit-Flip Transitions

States connected by a single qubit flip (Hamming distance = 1) show luminous connections. These represent allowed quantum transitions.

### 8. Spring-Back Motion = Quantum Potential Well

Dragging an orb and releasing it causes spring-back motion, simulating a particle in a harmonic potential well.

### 9. Trail Length = Probability-Weighted

Higher-probability states leave longer trails, emphasizing their measurement likelihood.

---

## Energy Shell Analogy

| Shell | Hamming Weight | States | Physical Analogy |
|-------|---------------|--------|------------------|
| n=0 | 0 | \|00000⟩ | Ground state, nucleus |
| n=1 | 1 | 5 states | First excited level |
| n=2 | 2 | 10 states | Second excited level |
| n=3 | 3 | 10 states | Third excited level |
| n=4 | 4 | 5 states | Fourth excited level |
| n=5 | 5 | \|11111⟩ | Maximum excitation |

---

## References

1. Kandala et al. (2017). Hardware-efficient variational quantum eigensolver. Nature, 549.
2. Peruzzo et al. (2014). Variational eigenvalue solver on a photonic processor. Nature Comm., 5.

