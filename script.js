(function() {
    'use strict';

    const PLANK_LENGTH = 400;
    const PIVOT_CENTER = PLANK_LENGTH / 2;
    const STORAGE_KEY = 'seesawState';

    const seesawCont = document.getElementById('seesaw-cont');
    const ballPreview = document.getElementById('ball-preview');
    const plank = document.getElementById('plank');
    const plankScale = document.getElementById('plank-scale');
    const historyList = document.getElementById('history-list');
    const leftWeightEl = document.getElementById('left-weight');
    const rightWeightEl = document.getElementById('right-weight');
    const nextWeightEl = document.getElementById('next-weight');
    const angleEl = document.getElementById('angle');
    const resetBtn = document.getElementById('reset');
    const pauseBtn = document.getElementById('pause');

    let objects = [];
    let dropHistory = [];
    let currentAngle = 0;
    let isPaused = false;
    let nextWeight = getRandomWeight();

    function getRandomWeight() {
        return Math.floor(Math.random() * 10) + 1;
    }

    function getRandomColorClass() {
        return 'color-' + (Math.floor(Math.random() * 10) + 1);
    }

    function buildScale() {
        for (let i = 0; i <= 400; i += 25) {
            const tick = document.createElement('div');
            tick.className = 'scale-tick' + (i % 100 === 0 ? ' major' : '');
            tick.style.left = i + 'px';
            plankScale.appendChild(tick);
        }
    }

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                objects = (data.objects || []).map(o => ({
                    weight: o.weight,
                    position: o.position,
                    colorClass: o.colorClass || getRandomColorClass()
                }));
                dropHistory = data.dropHistory || [];
                renderObjects();
                renderHistory();
                updateTilt();
                updateUI();
            }
        } catch (e) {
            objects = [];
            dropHistory = [];
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                objects: objects.map(o => ({ weight: o.weight, position: o.position, colorClass: o.colorClass })),
                dropHistory: dropHistory
            }));
        } catch (e) {}
    }

    function renderObjects() {
        const existing = plank.querySelectorAll('.obj');
        existing.forEach(el => el.remove());

        objects.forEach(obj => {
            const el = document.createElement('div');
            el.className = 'obj ' + obj.colorClass;
            el.style.left = obj.position + 'px';
            el.dataset.weight = obj.weight;
            const span = document.createElement('span');
            span.textContent = obj.weight + ' kg';
            el.appendChild(span);
            plank.appendChild(el);
        });
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (dropHistory.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'history-empty';
            empty.textContent = 'No balls dropped yet';
            historyList.appendChild(empty);
            return;
        }
        [...dropHistory].reverse().forEach((item, i) => {
            const el = document.createElement('div');
            el.className = 'history-item';
            const weightSpan = document.createElement('span');
            weightSpan.className = 'weight';
            weightSpan.textContent = item.weight + ' kg';
            const sideSpan = document.createElement('span');
            sideSpan.className = 'side ' + item.side;
            sideSpan.textContent = item.side === 'left' ? 'Left' : 'Right';
            el.appendChild(weightSpan);
            el.appendChild(sideSpan);
            historyList.appendChild(el);
        });
    }

    function computeTorques() {
        let leftTorque = 0;
        let rightTorque = 0;
        let leftWeight = 0;
        let rightWeight = 0;

        objects.forEach(obj => {
            const distance = Math.abs(obj.position - PIVOT_CENTER);
            const torque = obj.weight * distance;

            if (obj.position < PIVOT_CENTER) {
                leftTorque += torque;
                leftWeight += obj.weight;
            } else {
                rightTorque += torque;
                rightWeight += obj.weight;
            }
        });

        return { leftTorque, rightTorque, leftWeight, rightWeight };
    }

    function updateTilt() {
        const { leftTorque, rightTorque } = computeTorques();
        currentAngle = Math.max(-30, Math.min(30, (rightTorque - leftTorque) / 10));
        const transform = `rotate(${currentAngle}deg)`;
        plank.style.transform = transform;
        plankScale.style.transform = transform;
        angleEl.textContent = currentAngle.toFixed(1) + '°';
    }

    function updateUI() {
        const { leftWeight, rightWeight } = computeTorques();
        leftWeightEl.textContent = leftWeight.toFixed(1) + ' kg';
        rightWeightEl.textContent = rightWeight.toFixed(1) + ' kg';

        nextWeightEl.textContent = nextWeight + ' kg';
    }

    function dropPositionToPlank(clickX) {
        const rect = plank.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const angleRad = (currentAngle * Math.PI) / 180;
        const cosA = Math.cos(angleRad);
        if (Math.abs(cosA) < 0.01) return PIVOT_CENTER;
        return PIVOT_CENTER + (clickX - centerX) / cosA;
    }

    function animateBallDrop(clickX, clickY, dropX, dropY, weight, colorClass, onComplete) {
        const dx = dropX - clickX;
        const dy = dropY - clickY;

        const ball = document.createElement('div');
        ball.className = 'ball-falling animating ' + colorClass;
        ball.style.setProperty('--drop-dx', dx + 'px');
        ball.style.setProperty('--drop-dy', dy + 'px');
        ball.style.left = clickX + 'px';
        ball.style.top = clickY + 'px';
        ball.style.width = '36px';
        ball.style.height = '36px';

        const span = document.createElement('span');
        span.textContent = weight + ' kg';
        ball.appendChild(span);

        document.body.appendChild(ball);

        setTimeout(() => {
            ball.remove();
            onComplete();
        }, 600);
    }

    function addBallAtPosition(plankPosition, weight, colorClass) {
        const side = plankPosition < PIVOT_CENTER ? 'left' : 'right';
        dropHistory.push({ weight, side });

        objects.push({
            weight,
            position: plankPosition,
            colorClass
        });

        const el = document.createElement('div');
        el.className = 'obj ' + colorClass + ' landing';
        el.style.left = plankPosition + 'px';
        el.dataset.weight = weight;
        const span = document.createElement('span');
        span.textContent = weight + ' kg';
        el.appendChild(span);
        plank.appendChild(el);

        setTimeout(() => el.classList.remove('landing'), 300);

        nextWeight = getRandomWeight();

        updateTilt();
        updateUI();
        renderHistory();
        saveState();
    }

    function handleClick(e) {
        if (isPaused) return;
        if (e.target.closest('button, .control, .parameters, .parameter-box')) return;
        if (!seesawCont.contains(e.target)) return;

        const clickX = e.clientX;
        const clickY = e.clientY;

        const plankRect = plank.getBoundingClientRect();
        const dropY = plankRect.top + plankRect.height / 2;
        const dropX = clickX;

        const rawPosition = dropPositionToPlank(dropX);
        if (rawPosition < 0 || rawPosition > PLANK_LENGTH) return;

        const plankPosition = rawPosition;
        const weight = nextWeight;
        const colorClass = getRandomColorClass();

        animateBallDrop(clickX, clickY, dropX, dropY, weight, colorClass, () => {
            addBallAtPosition(plankPosition, weight, colorClass);
        });
    }

    function onSeesawMouseMove(e) {
        const rect = seesawCont.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ballPreview.style.left = (x - 18) + 'px';
        ballPreview.style.top = (y - 18) + 'px';
        ballPreview.textContent = nextWeight + ' kg';
    }

    function onSeesawMouseEnter() {
        if (!isPaused) ballPreview.classList.add('visible');
    }

    function onSeesawMouseLeave() {
        ballPreview.classList.remove('visible');
    }

    function resetSeesaw() {
        objects = [];
        dropHistory = [];
        nextWeight = getRandomWeight();
        renderObjects();
        renderHistory();
        updateTilt();
        updateUI();
        saveState();
    }

    function togglePause() {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
        pauseBtn.classList.toggle('paused', isPaused);
    }

    document.addEventListener('click', handleClick);
    seesawCont.addEventListener('mousemove', onSeesawMouseMove);
    seesawCont.addEventListener('mouseenter', onSeesawMouseEnter);
    seesawCont.addEventListener('mouseleave', onSeesawMouseLeave);
    resetBtn.addEventListener('click', resetSeesaw);
    pauseBtn.addEventListener('click', togglePause);

    buildScale();
    loadState();
    updateUI();
    renderHistory();
})();