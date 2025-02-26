"use client"

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Animated waveform background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://sjc.microlink.io/Ko7Z3zIjBlS8NQ90Sv3ebIyw6HQWj81W8VfyO1HeymDbk0HpuIHxlHVS0G5wAIgwtp6oHqbUgwVpU_ClFV0MEA.jpeg")',
        }}
      />

      {/* Blur and gradient overlay */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/50" />
    </div>
  )
}

