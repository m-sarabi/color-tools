const testColors = [
    [105, 87, 66],
    [86, 62, 40],
    [90, 66, 44],
    [108, 88, 60],
    [134, 126, 85],
    [147, 146, 92],
    [147, 138, 69],
    [156, 144, 78],
    [94, 70, 49],
    [98, 71, 47],
    [91, 72, 59],
    [69, 60, 56],
    [52, 44, 47],
    [102, 93, 69],
    [157, 143, 75],
    [187, 180, 133],
    [97, 71, 49],
    [95, 68, 45],
    [63, 55, 51],
    [168, 135, 119],
    [164, 119, 93],
    [69, 54, 49],
    [124, 118, 87],
    [182, 177, 154],
    [103, 76, 53],
    [98, 71, 47],
    [90, 74, 64],
    [156, 125, 110],
    [163, 121, 99],
    [100, 73, 61],
    [98, 88, 76],
    [137, 127, 95],
    [99, 72, 50],
    [98, 71, 45],
    [150, 123, 98],
    [179, 140, 126],
    [182, 133, 109],
    [170, 136, 111],
    [147, 134, 111],
    [133, 124, 96],
    [97, 70, 48],
    [106, 78, 53],
    [143, 123, 84],
    [134, 102, 82],
    [150, 103, 81],
    [158, 136, 116],
    [110, 100, 84],
    [133, 122, 100],
    [105, 78, 56],
    [112, 85, 62],
    [130, 119, 75],
    [128, 100, 71],
    [163, 102, 65],
    [228, 157, 88],
    [186, 143, 95],
    [150, 135, 102],
    [102, 77, 57],
    [128, 100, 69],
    [168, 107, 62],
    [149, 76, 57],
    [249, 163, 70],
    [245, 156, 56],
    [255, 169, 74],
    [253, 190, 117]
];

class Color {
    constructor(r, g = null, b = null) {
        if (g === null && b === null) {
            this._extractColor(r);
        } else {
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    _extractColor(color) {
        if (color.startsWith('#')) {
            this.r = parseInt(color.slice(1, 3), 16);
            this.g = parseInt(color.slice(3, 5), 16);
            this.b = parseInt(color.slice(5, 7), 16);
        } else if (color.startsWith('rgb')) {
            const rgb = color.slice(4, -1).split(',');
            this.r = parseInt(rgb[0]);
            this.g = parseInt(rgb[1]);
            this.b = parseInt(rgb[2]);
        }
    }

    rgb() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    hex() {
        const zeroPad = (num) => num.toString(16).padStart(2, '0');
        return `#${zeroPad(this.r)}${zeroPad(this.g)}${zeroPad(this.b)}`;
    }
}

class KMeans {
    constructor(k, colors) {
        this.k = k;
        this.colors = colors;
        this.clusters = [];
        this.assignments = new Array(colors.length);
        this.converged = false;
        this.count = 0;
    }

    kMeansPlusPlus() {
        const n = this.colors.length;
        const distances = new Array(n).fill(Infinity);

        this.clusters.push(this.colors[Math.floor(Math.random() * n)]);

        for (let i = 1; i < this.k; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                distances[j] = Math.min(distances[j], this.getDistance(this.colors[j], this.clusters[i - 1]));
                sum += distances[j];
            }

            let target = Math.random() * sum;
            for (let j = 0; j < n; j++) {
                target -= distances[j];
                if (target <= 0) {
                    this.clusters.push(this.colors[j]);
                    break;
                }
            }
        }
    }

    getDistance(color1, color2) {
        const r = color1[0] - color2[0];
        const g = color1[1] - color2[1];
        const b = color1[2] - color2[2];
        return Math.sqrt(r * r + g * g + b * b);
    }

    meanClusterColor(cluster) {
        const total = cluster.reduce((sum, color) => {
            return [
                sum[0] + color[0],
                sum[1] + color[1],
                sum[2] + color[2]
            ];
        }, [0, 0, 0]);
        return [
            Math.round(total[0] / cluster.length),
            Math.round(total[1] / cluster.length),
            Math.round(total[2] / cluster.length)
        ];
    }

    clusterPixels() {
        for (let i = 0; i < this.colors.length; i++) {
            let minDistance = Infinity;
            let closestCluster = -1;
            for (let j = 0; j < this.clusters.length; j++) {
                const distance = this.getDistance(this.colors[i], this.clusters[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = j;
                }
            }
            this.assignments[i] = closestCluster;
        }
    }

    updateClusters() {
        const newClusters = Array.from({length: this.k}, () => []);
        for (let i = 0; i < this.colors.length; i++) {
            newClusters[this.assignments[i]].push(this.colors[i]);
        }

        this.converged = true;
        for (let i = 0; i < this.clusters.length; i++) {
            const meanColor = this.meanClusterColor(newClusters[i]);
            if (this.getDistance(this.clusters[i], meanColor) > 0) {
                this.converged = false;
                this.clusters[i] = meanColor;
            }
        }
    }

    run() {
        this.kMeansPlusPlus();
        while (!this.converged) {
            this.clusterPixels();
            this.updateClusters();
        }
    }

    getClusters() {
        this.run();
        const colorCounts = this.clusters.map(() => 0);
        for (let i = 0; i < this.colors.length; i++) {
            colorCounts[this.assignments[i]]++;
        }
        return this.clusters.map((color, index) => {
            return {
                'color': color,
                'count': colorCounts[index]
            };
        });
    }
}

class MedianCut {
    constructor(m, colors) {
        this.m = m;
        this.n = 2 ** Math.ceil(Math.log2(m));
        this.boxes = [new MedianBox(colors)];
        this.count = 0;
    }

    run() {
        while (this.boxes.length < this.n) {
            const box = this.boxes.shift();
            if (box.colors.length > 1) {
                this.boxes.push(...box.split());
            }
        }

        this.reduce();

        this.boxes.sort((a, b) => b.colors.length - a.colors.length);
        const result = [];

        this.boxes.forEach((box) => {
            result.push({
                'color': this.calculateMeanColor(box.colors),
                'count': box.colors.length
            });
        });

        return result;
    }

    calculateMeanColor(colors) {
        const total = [0, 0, 0];
        for (let i = 0; i < colors.length; i++) {
            total[0] += colors[i][0];
            total[1] += colors[i][1];
            total[2] += colors[i][2];
        }
        return [
            Math.round(total[0] / colors.length),
            Math.round(total[1] / colors.length),
            Math.round(total[2] / colors.length)
        ];
    }

    calculateDistance(color1, color2) {
        const diffR = color1[0] - color2[0];
        const diffG = color1[1] - color2[1];
        const diffB = color1[2] - color2[2];
        return Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);
    }

    findClosestPair() {
        let minDistance = Infinity;
        let pair = [0, 1]; // Default pair
        for (let i = 0; i < this.boxes.length - 1; i++) {
            for (let j = i + 1; j < this.boxes.length; j++) {
                const meanColor1 = this.calculateMeanColor(this.boxes[i].colors);
                const meanColor2 = this.calculateMeanColor(this.boxes[j].colors);
                const distance = this.calculateDistance(meanColor1, meanColor2);
                if (distance < minDistance) {
                    minDistance = distance;
                    pair = [i, j];
                }
            }
        }
        return pair;
    }

    reduce() {
        while (this.boxes.length > this.m) {
            const pair = this.findClosestPair();
            const newBox = new MedianBox(this.boxes[pair[0]].colors.concat(this.boxes[pair[1]].colors));
            this.boxes.splice(pair[1], 1);
            this.boxes.splice(pair[0], 1);
            this.boxes.push(newBox);
        }
    }
}

class MedianBox {
    constructor(colors) {
        this.colors = colors;
        this.min = [255, 255, 255];
        this.max = [0, 0, 0];
        this.ranges = [0, 0, 0];
    }

    updateBounds() {
        for (let i = 0; i < this.colors.length; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.colors[i][j] < this.min[j]) {
                    this.min[j] = this.colors[i][j];
                }
                if (this.colors[i][j] > this.max[j]) {
                    this.max[j] = this.colors[i][j];
                }
            }
        }
    }

    updateRanges() {
        for (let i = 0; i < 3; i++) {
            this.ranges[i] = this.max[i] - this.min[i];
        }
    }

    split() {
        this.updateBounds();
        this.updateRanges();
        const longestAxis = this.ranges.indexOf(Math.max(...this.ranges));
        const middle = (this.min[longestAxis] + this.max[longestAxis]) / 2;
        const left = [];
        const right = [];
        for (let i = 0; i < this.colors.length; i++) {
            if (this.colors[i][longestAxis] < middle) {
                left.push(this.colors[i]);
            } else {
                right.push(this.colors[i]);
            }
        }
        if (left.length === 0) {
            return [new MedianBox(right)];
        }
        if (right.length === 0) {
            return [new MedianBox(left)];
        }
        return [new MedianBox(left), new MedianBox(right)];
    }
}

const random = {
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    choice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
};