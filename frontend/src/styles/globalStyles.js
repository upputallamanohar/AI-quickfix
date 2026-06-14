export const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #1d60e6;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  overflow: hidden;
}
#root { height: 100vh; display: flex; flex-direction: column; }
button { cursor: pointer; font-family: 'Inter', sans-serif; }
textarea, select, input { font-family: 'Inter', sans-serif; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`
