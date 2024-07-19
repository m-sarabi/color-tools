let activeTool;
let paletteMaxSize = 10;
let imageFile;

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

    get gradientElements() {
        const gradientColors = this.calculateGradient();
        const gradientDivs = [];
        gradientColors.forEach((color) => {
            gradientDivs.push(createColorBox(color));
        });
        gradientDivs.forEach((gradientDiv) => {
            gradientDiv.append(createCopyButton());
        });
        return gradientDivs;
    }
}

class ImagePalette {
    constructor(file) {
        this.file = file;
    }

    async getPixelsArray(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    let d = 1;
                    if (img.width * img.height > 600 * 600) {
                        d = Math.sqrt(img.width * img.height / (600 * 600));
                    }
                    canvas.width = img.width / d;
                    canvas.height = img.height / d;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    const pixelArray = [];
                    for (let i = 0; i < data.length; i += 4) {
                        pixelArray.push([data[i], data[i + 1], data[i + 2]]);
                    }
                    resolve(pixelArray);
                };
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async updatePreview() {
        const canvas = document.getElementById('image-preview');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.src = URL.createObjectURL(this.file);
        img.onload = () => {
            canvas.width = 300;
            canvas.height = img.height * 300 / img.width;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }

    async getPalette() {
        const pixelArray = await this.getPixelsArray(this.file);
        let kMeans = new KMeans(paletteMaxSize, pixelArray);
        let palette = kMeans.getClusters();
        let palettePercentages = [];
        for (let i in palette) {
            palettePercentages.push([new Color(...palette[i].color), Math.round((palette[i].count / pixelArray.length) * 10000) / 100]);
        }
        palettePercentages.sort((a, b) => b[1] - a[1]);
        return palettePercentages;
    }

    get gradientElements() {
        return new Promise(
            (resolve, reject) => {
                try {
                    this.getPalette().then(
                        (palette) => {
                            palette = palette.filter((color) => color[1] > 1);
                            const gradientDivs = [];
                            palette.forEach((color) => {
                                gradientDivs.push(createColorBox(color[0]));
                            });
                            gradientDivs.forEach((gradientDiv, index) => {
                                gradientDiv.style.flex = `${palette[index][1]} 1`;
                                gradientDiv.append(createCopyButton());
                            });
                            gradientDivs.forEach((gradientDiv, index) => {
                                gradientDiv.addEventListener('mouseover', () => {
                                    gradientDiv.style.flex = `${palette[index][1] * 2} 1`;
                                });
                                gradientDiv.addEventListener('mouseout', () => {
                                    gradientDiv.style.flex = `${palette[index][1]} 1`;
                                });
                            });
                            resolve(gradientDivs);
                        }
                    );
                } catch (e) {
                    reject(e);
                }
            }
        );

    }
}

function createColorBox(color) {
    const colorBox = document.createElement('div');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = color.rgb();
    colorBox.addEventListener('click', () => {
        navigator.clipboard.writeText(color.hex()).then();
    });
    return colorBox;
}

function createCopyButton() {
    const button = document.createElement('div');
    button.classList.add('copy-btn');
    const text = document.createElement('span');
    text.innerHTML = 'copy';
    button.appendChild(text);
    return button;
}

function updateGradient() {
    const color1 = document.querySelector('#gradient-color1').value;
    const color2 = document.querySelector('#gradient-color2').value;
    const number = document.querySelector('#gradient-number').value;
    const gradient = new Gradient(new Color(color1), new Color(color2), number);
    document.querySelector('#gradient-colors').innerHTML = "";
    document.querySelector('#gradient-colors').append(...gradient.gradientElements);
}

async function updateImagePalette(file) {
    document.getElementById("palette-range").setAttribute('disabled', 'true');
    document.getElementById("palette-number").setAttribute('disabled', 'true');
    const imagePalette = new ImagePalette(file);
    document.querySelector('#image-palette-colors').innerHTML = "";
    document.querySelector('#image-palette-colors').append(...await imagePalette.gradientElements);
    document.getElementById('palette-image-file').value = "";
    document.getElementById("palette-range").removeAttribute('disabled');
    document.getElementById("palette-number").removeAttribute('disabled');
}

function initEvents() {
    document.addEventListener('input', (e) => {
            function limitInput(e) {
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
            }

            if (activeTool === 'gradient-tool') {
                if (e.target.nodeName === 'INPUT' && e.target.type === 'color') {
                    switch (e.target.id) {
                        case 'gradient-color1':
                        case 'gradient-color2':
                            e.target.parentNode.style.background = e.target.value;
                            break;
                    }
                } else if (e.target.nodeName === 'INPUT' && e.target.type === 'number') {
                    limitInput(e);
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
            } else if (activeTool === 'image-palette-tool') {
                if (e.target.nodeName === 'INPUT' && e.target.type === 'number') {
                    limitInput(e);
                    switch (e.target.id) {
                        case 'palette-number':
                            document.querySelector('#palette-range').value = e.target.value;
                            paletteMaxSize = e.target.value;
                            break;
                    }
                } else if (e.target.nodeName === 'INPUT' && e.target.type === 'range') {
                    switch (e.target.id) {
                        case 'palette-range':
                            document.querySelector('#palette-number').value = e.target.value;
                            paletteMaxSize = e.target.value;
                            break;
                    }
                }
            }
        }
    );
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('sidebar-btn')) {
            hideAllTools();
            switch (e.target.id) {
                case 'gradient-btn':
                    document.querySelector('#gradient-tools').style.display = 'flex';
                    activeTool = 'gradient-tool';
                    break;

                case 'image-palette-btn':
                    document.querySelector('#image-palette-tools').style.display = 'flex';
                    activeTool = 'image-palette-tool';
                    break;
            }
        } else if (e.target.id === 'image-preview') {
            document.getElementById('palette-image-file').click();
        }
    });
    document.addEventListener('change', async function (e) {
        if (e.target.id === 'palette-image-file') {
            const file = e.target.files[0];
            imageFile = file;
            const imagePalette = new ImagePalette(file);
            await imagePalette.updatePreview();
            updateImagePalette(file).then();
        } else if (e.target.id === "palette-range" || e.target.id === "palette-number") {
            if (imageFile) {
                updateImagePalette(imageFile).then();
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
    activeTool = 'gradient-tool';
    hideAllTools();
    document.querySelector('#gradient-tools').style.display = 'flex';
    initEvents();
    document.querySelectorAll("input[type=color]").forEach((input) => {
        let parent = input.parentNode;
        parent.style.background = input.value;
    });
    let canvas = document.getElementById('image-preview');
    let ctx = canvas.getContext('2d');
    let selectImage = new Image();
    selectImage.src = "./assets/select-image.jpg";
    selectImage.onload = () => {
        canvas.width = 300;
        canvas.height = selectImage.height * 300 / selectImage.width;
        ctx.drawImage(selectImage, 0, 0, canvas.width, canvas.height);
    };

}

document.addEventListener('DOMContentLoaded', () => {
    init();
    updateGradient();
});