# The Mathematics of Identity

> *"In the quantum world, your name becomes a universe."*

---

## Why This Matters

This may seem like a simple project—hash a name, run a circuit, draw some circles. But beneath the surface lies something profound.

### The Uniqueness Problem

How unique is your fingerprint? Your DNA? Your face?

- **Fingerprints**: ~64 bits of entropy (limited by sensor resolution)
- **DNA**: Variable, but shared 99.9% with every human
- **Facial recognition**: ~128 dimensions of embeddings

Now consider a **quantum fingerprint**:

With just 5 qubits and 40 rotation angles, each angle having ~64 bits of floating-point precision:
- **Total parameter space**: 40 × 64 = 2,560 bits
- **Possible circuits**: more than 10^770

That's more unique configurations than atoms in the observable universe... *by a factor of 10^690*.

---

## The Beautiful Paradox

Here's what makes quantum computing philosophically fascinating:

1. **Determinism from randomness**: The circuit is entirely deterministic—same name, same angles, same circuit. But the *measurements* are inherently random. Real quantum hardware introduces genuine cosmic randomness.

2. **Superposition of identity**: Before measurement, your quantum state exists as a superposition of *all possible outcomes*. Your name is simultaneously all 32 possible states. Only when observed does it collapse into the distribution you see.

3. **Entanglement as connection**: The CNOT gates in our circuit create entanglement—qubits become correlated in ways that have no classical analog. Your name's letters don't just influence individual qubits; they influence the *relationships between* them.

---

## The Art in the Math

Every visual element is physics, not decoration:

| What You See | The Hidden Beauty |
|--------------|-------------------|
| Orbital shells | Energy quantization—the same principle that gives atoms their structure |
| Bigger orbs | Probability amplitude—the square root of likelihood, a ghost of possibility |
| Glowing trails | Measurement probability—nature's voting system for reality |
| Connecting lines | Single-bit-flip transitions—the shortest path between quantum states |
| Spring-back motion | Harmonic potential—the universe's favorite oscillator |

---

## Why 100 Shots?

We use exactly 100 measurements. Not 1,000. Not 10,000.

**This is intentional.**

With more measurements, the probability distribution smooths out, approaching the theoretical prediction. It becomes *predictable*. *Classical*.

With 100 shots, you see the **quantum grain**—the irreducible randomness that exists at the heart of reality. Each missing state, each unexpected spike, each asymmetry is a whisper from the quantum world.

This is not noise. This is **nature speaking**.

---

## A Meditation on Names

Your name is just a string of characters. Letters. Unicode points.

But through this project, it becomes:
- A **seed** (a 32-bit integer)
- A **parameter vector** (40 angles in Hilbert space)
- A **quantum circuit** (unitary transformation on 5 qubits)
- A **probability distribution** (the measurement statistics)
- A **visual universe** (the art you see)

At each stage, information is preserved but *transformed*. Your name never really disappears—it's encoded in the rotation angles, expressed through the gates, manifested in the superposition, revealed through collapse.

The art you see is your name, dreaming.

---

## The Humble Truth

Is this project revolutionary? No.

It's a simple pipeline: hash → angles → circuit → measurement → visualization.

But simplicity is not the opposite of depth. The same could be said of:
- E = mc²
- F = ma  
- 1 + 1 = 2

Simple implementations can touch profound truths.

This project is a window—not into advanced quantum algorithms, but into the *texture* of quantum mechanics. The way superposition feels. The way measurement looks. The way probability flows like water into orbital shells.

If this visualization makes someone curious about quantum computing, if it makes the abstract feel tangible, if it turns mathematics into something you can *experience*—then it has succeeded.

---

## Parametric Quantum Circuits

This project uses a **Parametric Quantum Circuit** (PQC) based on the **EfficientSU2** ansatz. The circuit transforms an initial ground state into a complex superposition determined by 40 rotation angles derived from the user's name.

### Circuit Formulation

The quantum circuit implements:

$$U(\vec{\theta}) = \prod_{d=1}^{D} \left(U_{ent} \prod_{i=1}^{n} R_y(\theta_{d,i}^y) R_z(\theta_{d,i}^z) \right)$$

Where:
- D = 3 layers
- n = 5 qubits
- U_ent = entangling layer (CNOT gates)
- R_y, R_z = rotation gates

### Rotation Gates

$$R_y(\theta) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

$$R_z(\theta) = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}$$

### Parameter Count

For 5 qubits and 3 layers:
- Parameters = (D + 1) × n × 2 = 4 × 5 × 2 = **40 angles**

### Deterministic Seeding

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

---

<p align="center"><em>Built with curiosity, documented with wonder.</em></p>
