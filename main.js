window.onload = () => {
    const overlay = document.getElementById('start-overlay');
    const btn = document.getElementById('start-btn');
    const mainPage = document.getElementById('main-page');
    const audio = document.getElementById('bgm');
    const video = document.getElementById('main-vid');
    const text = document.querySelector('.Text_main');

    let audioCtx, analyser, dataArray, source;
    let currentScale = 1;

    btn.addEventListener('click', () => {
        // 1. 메인 페이지 노출 및 스크롤 잠금 해제
        mainPage.style.display = 'block';
        document.body.style.overflow = 'auto'; 
        document.documentElement.style.overflow = 'auto';

        // 2. 오디오 분석기 초기화
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 512;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            draw();
        }

        // 3. 미디어 재생
        audio.play().catch(e => console.log("Audio play error:", e));
        video.muted = false;
        video.play();
        
        // 4. 오버레이 페이드 아웃 후 제거
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 800);
    });

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        // 베이스 비트 감지 (인덱스 0~10)
        let bassSum = 0;
        for (let i = 0; i < 10; i++) bassSum += dataArray[i];
        const avg = bassSum / 10;

        const threshold = 150; // 감도 조절 (반응이 적으면 낮추세요)
        let targetScale = 1;

        if (avg > threshold) {
            const intensity = (avg - threshold) / (255 - threshold);
            targetScale = 1 + (intensity * 0.15); 
        }

        // 부드러운 스케일링 (Lerp)
        currentScale += (targetScale - currentScale) * 0.1;
        text.style.transform = `translate(-50%, -50%) scale(${currentScale})`;

        // 비각 효과 연동
        if (currentScale > 1.01) {
            text.style.color = "#ffffff";
            text.style.textShadow = "0 0 30px rgba(255, 255, 255, 0.6)";
        } else {
            text.style.color = "rgb(182, 182, 193)";
            text.style.textShadow = "none";
        }
    }
};