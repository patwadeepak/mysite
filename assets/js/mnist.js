window.addEventListener("load", () => {
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext("2d");

    // Resizing and positioning
    canvas.height = 300;
    canvas.width = 300;

    // variables
    let drawing = false;
    let mousePos = {
        x: 0,
        y: 0
    };
    let lastPos = mousePos;

    function startPosition(e) {
        drawing = true;
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        lastPos = getMousePos(canvas, e);
    }

    function endPosition() {
        drawing = false;
        ctx.beginPath();
    }

    function moving(e) {
        mousePos = getMousePos(canvas, e);
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', moving);

    // Get position relative to canvas
    function getMousePos(canvasDom, mouseEvent) {
        let rect = canvasDom.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top
        };
    }

    // regular interval to draw on the screen
    window.requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimaitonFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    // Finally draw on the canvas
    function renderCanvas() {
        if (drawing) {
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
            ctx.beginPath();
            lastPos = mousePos;
        }
    }

    // Allow for animation
    (function drawLoop() {
        requestAnimFrame(drawLoop);
        renderCanvas();
    })();

    // Set up touch events for mobile, etc
    canvas.addEventListener("touchstart", function (e) {
        mousePos = getTouchPos(canvas, e);
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchend", function (e) {
        var mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchmove", function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);

    // Get the position of a touch relative to the canvas
    function getTouchPos(canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    }

    // Load model
    function processModel(data){
        let model = tf.loadLayersModel('./model/model.json');
        model.then((actual_model) => {
            let arr = actual_model.predict(data).dataSync();
            let i = arr.indexOf(Math.max(...arr));
            // console.log(i);
            document.querySelector('#output').innerText = ' Digit = '+i;
        }).catch((message) => 
            console.log('Caught this error:'+message)
        );
    };
     

    //setup predict func
    function predict() {
        const example = tf.image.resizeNearestNeighbor(tf.browser.fromPixels(canvas, 4), [28, 28]).sum(2, true).reshape([-1, 28, 28, 1]);
        const maxPixVal = tf.scalar(255);
        const sample = tf.div(example, maxPixVal);
        try {
            processModel(sample);
        } catch (error) {
            console.log(error);
        }
    }

    //setup event listener for predict
    canvas.addEventListener("mouseup", predict);

});