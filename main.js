(() => {
  // canvas.addEventListener('mousemove', (evt) => {
  //   const mousePos = getMousePos(canvas, evt);
  //   const messageX = `Mouse position X: ${mousePos.x}`;
  //   const messageY = `Mouse position Y: ${mousePos.y}`;
  //   writeMessage(canvas, messageX, messageY);
  // }, false);

  const canvasW = document.getElementById('webgl');
  const gl = canvasW.getContext('webgl');
  canvasW.width = window.innerWidth - 100;
  canvasW.height = window.innerHeight / 2;

  // -------------2d-----------------------------
  const canvas = document.getElementById('2d');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth - 50;
  canvas.height = (window.innerHeight / 2) + 100;

  $('#2d').ready(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // H
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // V
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.width);
    ctx.stroke();
  });

  const writeMessage = (messageX, messageY) => {
    let x = (messageX * (6144)) / (canvas.width - 50);
    if (x > 6144) x = 6144;
    ctx.clearRect(messageX, messageY, 60, 19);
    ctx.font = '15px Ubuntu Mono';
    ctx.fillStyle = '#fff';
    ctx.fillText(x.toFixed(2), messageX - 25, 45);
    // ctx.fillText(messageY, 10, 50);
  };

  const drawCrossHair = (mousePosX, mousePosY) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mousePosY < 50) mousePosY = 50;
    if (mousePosY > 410) {
      mousePosY = 410;
    }
    // H
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.moveTo(0, mousePosY);
    ctx.lineTo(canvas.width - 51, mousePosY);
    ctx.stroke();

    if (mousePosX > canvasW.width) mousePosX = canvasW.width;

    // V
    ctx.beginPath();
    ctx.moveTo(mousePosX, 50);
    ctx.lineTo(mousePosX, 410);
    ctx.stroke();

    // V label
    ctx.beginPath();
    ctx.fillStyle = 'teal';
    ctx.moveTo(mousePosX, 30);
    ctx.fillRect(mousePosX - 30, 30, 60, 19);
    ctx.stroke();

    writeMessage(mousePosX, mousePosY);
  };

  const getMousePos = (evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  };

  const DragMouse = (e) => {
    const mousePos = getMousePos(e);
    let mx = mousePos.x;
    let my = mousePos.y;

    if (Number.isNaN(mx)) {
      mx = e.originalEvent.touches[0].pageX;
      my = e.originalEvent.touches[0].pageY;
    }

    drawCrossHair(mx, my);
  };

  // $('#2d').on('mousedown touchstart', MouseDown);
  $('#2d').on('mousemove touchstart', DragMouse);


  // function MouseDown() {
  //   $('#canvas').on('mousemove touchmove', DragMouse);
  // }


  window.blockMenuHeaderScroll = false;
  $(window).on('touchstart', (e) => {
    if ($(e.target).closest('#2d').length === 1) {
      window.blockMenuHeaderScroll = true;
    }
  });
  $(window).on('touchend', () => {
    window.blockMenuHeaderScroll = false;
  });
  $(window).on('touchmove', (e) => {
    if (window.blockMenuHeaderScroll) {
      e.preventDefault();
    }
  });


  // ------------------webgl--------------------------
  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  };

  const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  };

  const VSHADER_SOUCE = `
    attribute vec4 a_Position;
    uniform vec4 u_Translation;

    void main() {
      gl_Position = a_Position + u_Translation;
    }
  `;

  const FSHADER_SOURCE = `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `;


  function initVertexBuffers(gl) {
    const vertices = new Float32Array([
      0.0, 0.5, -0.5, -0.5, 0.5, -0.5,
    ]);
    const m = 3;

    const vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(PROGRAM, 'a_Position');
    const uTranslation = gl.getUniformLocation(PROGRAM, 'u_Translation');

    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    return m;
  }

  const VS = createShader(gl, gl.VERTEX_SHADER, VSHADER_SOUCE);
  const FS = createShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE);
  const PROGRAM = createProgram(gl, VS, FS);
  gl.useProgram(PROGRAM);

  const n = initVertexBuffers(gl);
  if (n < 0) return false;

  gl.clearColor(0.0, 0.0, 0.0, 0.2);
  gl.clear(gl.COLOR_BUFFER_BIT);


  const aPosition = gl.getAttribLocation(PROGRAM, 'a_Position');
  const uTranslation = gl.getUniformLocation(PROGRAM, 'u_Translation');
  const Tx = 0.5;
  const Ty = 0.5;
  const Tz = 0.0;


  gl.vertexAttrib3f(aPosition, 0.0, 0.0, 0.0);
  gl.uniform4f(uTranslation, Tx, Ty, Tz, 0.0);

  gl.drawArrays(gl.TRIANGLES, 0, n);
})();
