document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const originalImage = document.getElementById('originalImage');
    const svgPreview = document.getElementById('svgPreview');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // 点击上传区域触发文件选择
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // 处理拖拽事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            handleImage(file);
        }
    });

    // 处理文件选择
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImage(file);
        }
    });

    // 处理图片转换
    function handleImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // 显示原始图片
            originalImage.src = e.target.result;
            
            const img = new Image();
            img.onload = () => {
                // 创建canvas并限制大小为256x256
                const canvas = document.createElement('canvas');
                const maxSize = 256;
                let width = img.width;
                let height = img.height;
                
                // 计算缩放比例
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 获取图片数据
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // 配置转换参数
                const options = {
                    ltres: 0.1,          // 降低线条阈值，保留更多细节（原值：1）
                    qtres: 0.1,          // 降低曲线阈值，使曲线更平滑（原值：1）
                    pathomit: 1,         // 降低路径省略值，保留更多路径（原值：8）
                    colorsampling: 1,    // 更精确的颜色采样（原值：2）
                    numberofcolors: 64,  // 增加颜色数量，提高色彩还原度（原值：16）
                    mincolorratio: 0,    // 保留所有颜色
                    colorquantcycles: 5, // 增加颜色量化循环次数，提高颜色精确度（原值：3）
                    blurradius: 0,       // 不进行模糊处理，保持边缘锐利
                    blurdelta: 20,       // 模糊差值
                    strokewidth: 1,      // 描边宽度
                    linefilter: false,   // 禁用线条过滤，保留更多细节
                    scale: 1,            // 保持���始大小
                    roundcoords: 1,      // 坐标四舍五入到小数点后 1 位，平衡精度和文件大小
                    viewbox: true,       // 使用 viewBox，便于缩放
                    desc: false,         // 不添加描述，减小文件体积
                    lcpr: 0,            // 禁用长曲线优化
                    qcpr: 0,            // 禁用二次曲线优化
                    rightangleenhance: false // 禁用直角增强
                };
                
                // 使用 ImageTracer 转换为 SVG
                const svgString = ImageTracer.imagedataToSVG(imageData, options);
                
                // 修改 SVG 显示方式
                svgPreview.innerHTML = '';  // 清空之前的内容
                const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
                const svgUrl = URL.createObjectURL(svgBlob);
                const svgImage = document.createElement('img');
                svgImage.src = svgUrl;
                svgImage.style.maxWidth = '100%';
                svgImage.style.maxHeight = '100%';
                svgPreview.appendChild(svgImage);
                
                // 启用下载按钮
                downloadBtn.disabled = false;
                
                // 绑定下载事件
                downloadBtn.onclick = () => {
                    const blob = new Blob([svgString], {type: 'image/svg+xml'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${file.name.split('.')[0]}.svg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                };
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});