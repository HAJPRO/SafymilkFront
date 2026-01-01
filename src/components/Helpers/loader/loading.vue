<template>
  <div class="loader-overlay">
    <div class="loader-content">
      <div class="logo-wrapper">
        <div class="liquid-ring"></div>
        <div class="logo-container">
          <img
            src="/public/safymilk_logo_4.jpg"
            alt="Safy Logo"
            class="main-logo"
          />
        </div>
      </div>

      <div class="text-container">
        <span class="brand-name">Safymilk</span>
        <div class="loading-bar-container">
          <div class="loading-bar-fill"></div>
        </div>
        <p class="slogan">Tabiiylik va Mehr uyg'unligi</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Overlay with deep aesthetic blur */
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
  backdrop-filter: blur(12px);
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

/* Advanced Liquid Ring Animation */
.logo-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.liquid-ring {
  position: absolute;
  inset: 0;
  border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
  background: linear-gradient(45deg, #4f46e5, #10b981, #ffffff);
  filter: blur(2px);
  animation: liquid-morph 6s linear infinite alternate;
  opacity: 0.8;
  box-shadow: 0 0 40px rgba(79, 70, 229, 0.3);
}

.logo-container {
  position: relative;
  z-index: 2;
  width: 150px;
  height: 150px;
  background: white;
  border-radius: 50%;
  padding: 5px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.main-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  animation: logo-breathe 3s ease-in-out infinite;
}

/* Text and Slogan Styles */
.text-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-name {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #fff, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-bar-container {
  width: 120px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.loading-bar-fill {
  width: 40%;
  height: 100%;
  background: #4f46e5;
  border-radius: 10px;
  animation: loading-move 2s ease-in-out infinite;
}

.slogan {
  color: #94a3b8;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  opacity: 0.8;
  animation: fade-pulse 2s ease-in-out infinite;
}

/* Keyframes for professional feel */
@keyframes liquid-morph {
  0% { border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%; transform: rotate(0deg); }
  100% { border-radius: 62% 38% 37% 63% / 59% 56% 44% 41%; transform: rotate(180deg); }
}

@keyframes logo-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes loading-move {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(250%); }
}

@keyframes fade-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>