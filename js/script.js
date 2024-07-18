class Gradient {
    constructor(color1, color2, number) {
        this.color1 = color1;
        this.color2 = color2;
        this.number = number;
    }

    calculateGradient() {
        let gradientColors = [];
        let r1 = this.color1.r;
        let g1 = this.color1.g;
        let b1 = this.color1.b;
        let r2 = this.color2.r;
        let g2 = this.color2.g;
        let b2 = this.color2.b;
        for (let i = 0; i < this.number; i++) {
            let r = Math.round(r1 + (r2 - r1) * i / (this.number - 1));
            let g = Math.round(g1 + (g2 - g1) * i / (this.number - 1));
            let b = Math.round(b1 + (b2 - b1) * i / (this.number - 1));
            gradientColors.push(new Color(r, g, b));
        }
        return gradientColors;
    }

    createColorBox(color) {
        const colorBox = document.createElement('div');
        colorBox.classList.add('color-box');
        colorBox.style.backgroundColor = color.rgb();
        colorBox.addEventListener('click', () => {
            navigator.clipboard.writeText(color.hex()).then();
        });
        return colorBox;
    }

    createCopyButton() {
        const button = document.createElement('div');
        button.classList.add('copy-btn');
        const text = document.createElement('span');
        text.innerHTML = 'copy';
        button.appendChild(text);
        return button;
    }

    get gradientElements() {
        const gradientColors = this.calculateGradient();
        const gradientDivs = [];
        gradientColors.forEach((color) => {
            gradientDivs.push(this.createColorBox(color));
        });
        gradientDivs.forEach((gradientDiv) => {
            gradientDiv.append(this.createCopyButton());
        });
        return gradientDivs;
    }
}

function updateGradient() {
    const color1 = document.querySelector('#gradient-color1').value;
    const color2 = document.querySelector('#gradient-color2').value;
    const number = document.querySelector('#gradient-number').value;
    const gradient = new Gradient(new Color(color1), new Color(color2), number);
    document.querySelector('#gradient-colors').innerHTML = "";
    document.querySelector('#gradient-colors').append(...gradient.gradientElements);
}

function initEvents() {
    document.addEventListener('input', (e) => {
            console.log(e.target.type);
            if (e.target.nodeName === 'INPUT' && e.target.type === 'color') {
                switch (e.target.id) {
                    case 'gradient-color1':
                    case 'gradient-color2':
                        e.target.parentNode.style.background = e.target.value;
                        break;
                }
            } else if (e.target.nodeName === 'INPUT' && e.target.type === 'number') {
                if (e.target.hasAttribute('max')) {
                    if (parseInt(e.target.value) > parseInt(e.target.getAttribute('max'))) {
                        e.target.value = e.target.getAttribute('max');
                    }
                }
                if (e.target.hasAttribute('min')) {
                    if (parseInt(e.target.value) < parseInt(e.target.getAttribute('min'))) {
                        e.target.value = e.target.getAttribute('min');
                    }
                }
                switch (e.target.id) {
                    case 'gradient-number':
                        document.querySelector('#gradient-range').value = e.target.value;
                        break;
                }
            } else if (e.target.nodeName === 'INPUT' && e.target.type === 'range') {
                switch (e.target.id) {
                    case 'gradient-range':
                        document.querySelector('#gradient-number').value = e.target.value;
                        break;
                }
            }
            updateGradient();
        }
    );
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('sidebar-btn')) {
            hideAllTools();
            switch (e.target.id) {
                case 'gradient-tool':
                    document.querySelector('#gradient-tools').style.display = 'flex';
                    break;

                case 'color-picker':
                    document.querySelector('#color-picker-tools').style.display = 'flex';
                    break;
            }
        }
    });
}

function hideAllTools() {
    const displays = document.querySelectorAll('.tool-container');
    displays.forEach((display) => {
        display.style.display = 'none';
    });
}


function init() {
    hideAllTools();
    document.querySelector('#gradient-tools').style.display = 'flex';
    initEvents();
    document.querySelectorAll("input[type=color]").forEach((input) => {
        let parent = input.parentNode;
        parent.style.background = input.value;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    updateGradient();
});