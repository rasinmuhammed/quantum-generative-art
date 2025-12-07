# The Quantum Canvas

**Turn any name into a unique quantum universe.**

Every person's name, processed through a 5-qubit quantum circuit, produces a one-of-a-kind visualization. The probability distribution from 100 quantum measurements becomes a living planetary system where physics determines beauty.

🔗 **[Live Demo](https://rasinmuhammed.github.io/quantum-generative-art/)** *(after running on real quantum hardware)*

---

## The Story Behind This Project

I stumbled upon [Real Python's quantum computing tutorial](https://realpython.com/quantum-computing-basics/) and got curious. After spending time learning Qiskit basics and exploring the [IBM Quantum documentation](https://quantum.cloud.ibm.com/), I discovered their free tier gives you 10 minutes of real quantum computing time each month.

I wanted to build something that would make that 10 minutes count—something visual, something personal, something that proves quantum computers aren't just hype. The idea: what if your name could become a unique quantum fingerprint?

This project is that experiment. With help from AI and IBM's documentation, I built a system that transforms any name into a deterministic quantum circuit, runs it on real quantum hardware, and visualizes the measurement results as an interactive cosmos.

Same name = same universe. Always.

---

## What This Project Does

1. **Hash your name** into a deterministic seed
2. **Generate 40 rotation angles** from that seed  
3. **Build a parameterized quantum circuit** (EfficientSU2 ansatz)
4. **Execute 100 measurements** on a simulator or IBM Quantum hardware
5. **Visualize the probability distribution** as an interactive cosmos

---

## The Physics Behind the Art

This isn't random visualization. Every visual element maps to a quantum property:

| What You See | Quantum Source |
|--------------|----------------|
| Orbital shell position | Hamming weight (number of 1s in bitstring) |
| Color hue | Phase angle in Hilbert space |
| Orb size | Amplitude √P |
| Glow intensity | Measurement probability P(x) |
| Orbital period | T ∝ 1/(n+1), slower for higher energy |
| Connection lines | States differing by 1 bit (single qubit flip) |

States with more excited qubits orbit in higher shells—just like electrons in atoms.

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/rasinmuhammed/quantum-generative-art.git
cd quantum-generative-art
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Generate quantum art (local simulator)
python -m src.quantum_canvas "Your Name"

# View in browser
cd web && python3 -m http.server 8080
# Open http://localhost:8080
```

---

## Running on Real Quantum Hardware

This project is designed for IBM Quantum's free tier (10 minutes/month):

```bash
# One-time setup
python -c "from qiskit_ibm_runtime import QiskitRuntimeService; QiskitRuntimeService.save_account(channel='ibm_quantum', token='YOUR_TOKEN')"

# Run on real quantum hardware
python -m src.quantum_canvas --cloud "Your Name"
```

The 100-shot limit preserves "quantum grain"—the natural randomness that makes each execution subtly different on real hardware.

---

## Hosting on GitHub Pages

After running on real quantum hardware:

```bash
# The quantum_data.json in web/ will have real quantum results
git add .
git commit -m "Add real quantum data"
git push origin main

# Enable GitHub Pages in repo settings → Pages → Source: main → /web
```

Your live visualization will be at: `https://rasinmuhammed.github.io/quantum-generative-art/`

---

## Project Structure

```
quantum-generative-art/
├── src/
│   ├── quantum_canvas.py   # Core quantum circuit logic
│   └── utils.py            # Hash and parameter utilities
├── web/
│   ├── index.html          # Frontend (GitHub Pages entry)
│   ├── sketch.js           # p5.js visualization
│   └── quantum_data.json   # Generated measurement data
├── docs/
│   └── theory.md           # Mathematical foundations
└── requirements.txt
```

---

## How It Works

### 1. Name → Seed
```python
seed = int(hashlib.sha256(name.encode()).hexdigest(), 16) % (2**32)
```

### 2. Seed → Circuit Parameters
```python
rng = np.random.default_rng(seed)
parameters = rng.uniform(0, 2 * np.pi, num_params)
```

### 3. Circuit → Measurements
The EfficientSU2 ansatz applies:
- RY and RZ rotation gates (parameterized by above angles)
- Full entanglement between all qubits
- 3 repetition layers

### 4. Measurements → Visualization
Each bitstring `|01101⟩` becomes an orb:
- **Shell** = count of 1s (Hamming weight)
- **Angle** = position within shell
- **Size** = √(count/total)
- **Color** = mapped from state value

---

## API

```python
from src import QuantumCanvas

canvas = QuantumCanvas(use_cloud=False)
result = canvas.generate_art("Your Name")

print(result.counts)      # {'01101': 12, '00011': 8, ...}
print(result.num_states)  # Number of unique states measured
```

---

## License

MIT

---

## Acknowledgments

- [Real Python](https://realpython.com/quantum-computing-basics/) - Where it all started
- [IBM Quantum](https://quantum.ibm.com/) - Free quantum computing access
- [Qiskit](https://qiskit.org/) - Quantum computing SDK
- [p5.js](https://p5js.org/) - Creative coding library

---

<p align="center">
  Built with ⚛️ by <a href="https://github.com/rasinmuhammed">Muhammed Rasin</a>
</p>
