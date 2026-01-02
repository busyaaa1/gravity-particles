import './style.css'

// 1. Инициализация холста
const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 2. Универсальное состояние "курсора"
interface Mouse {
    x: number | undefined;
    y: number | undefined;
    radius: number;
}

const mouse: Mouse = {
    x: undefined,
    y: undefined,
    radius: 150 
};

// --- ОБРАБОТКА СОБЫТИЙ (ПК + МОБИЛКИ) ---

// Мышь (ПК)
window.addEventListener('mousemove', (event: MouseEvent) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Касание (Мобилки)
window.addEventListener('touchstart', (event: TouchEvent) => {
    if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    }
}, { passive: false });

window.addEventListener('touchmove', (event: TouchEvent) => {
    if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    }
}, { passive: false });

// Когда убираем палец или мышь уходит из окна
const handleEnd = () => {
    mouse.x = undefined;
    mouse.y = undefined;
};

window.addEventListener('touchend', handleEnd);
window.addEventListener('mouseout', handleEnd);

// 3. Класс Частицы
class Particle {
    x: number;
    y: number;
    size: number;
    baseX: number;
    baseY: number;
    density: number;
    color: string;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = Math.random() * 2 + 1;
        this.density = (Math.random() * 30) + 5;

        // Палитра: разные оттенки розового
        const h = Math.floor(Math.random() * 50) + 300; 
        const s = Math.floor(Math.random() * 40) + 60;  
        const l = Math.floor(Math.random() * 40) + 40;  
        this.color = `hsl(${h}, ${s}%, ${l}%)`;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Если курсор/палец на экране, считаем взаимодействие
        if (mouse.x !== undefined && mouse.y !== undefined) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.radius - distance) / mouse.radius;
                
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                this.x -= directionX;
                this.y -= directionY;
            } else {
                this.returnHome();
            }
        } else {
            this.returnHome();
        }
    }

    // Метод плавного возврата в исходную точку
    returnHome() {
        if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 15;
        }
        if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 15;
        }
    }
}

// 4. Управление системой
let particlesArray: Particle[] = [];

function init() {
    particlesArray = [];
    
    // Оптимизация: меньше частиц для маленьких экранов
    const isMobile = window.innerWidth < 768;
    const numberOfParticles = isMobile ? 1200 : 2500; 
    mouse.radius = isMobile ? 100 : 170; // Уменьшаем радиус влияния на мобилках

    for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y));
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
}

// Запуск
init();
animate();

// Ресайз окна
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});