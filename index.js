document.getElementById('hello').textContent = 'Mine Sweeper'

const rows = 14, columns = 18, bombs = Math.round(0.15*rows*columns);
const grid = document.getElementById('grid');
grid.style.gridTemplateColumns = `repeat(${columns}, 50px)`;
const boxes = []
const states = []

/**
 * Create an element
 * @param {string} tag Tag name of the element
 * @param {Object} attr attributes
 * @param {Element} parent
 * @returns {Element} Element created
 */
function el(tag, attr, parent) {
  const x = document.createElement(tag);
  if (parent) parent.appendChild(x);
  if (attr) Object.entries(attr).forEach(([k, v]) => x[k] = v);
  return x;
}

function around(i) {
  const deltas = [-1, 0, 1];

  const x = i % columns;
  const y = Math.floor(i / columns);
  const aroundPos = [];
  deltas.forEach(dx => {
    deltas.forEach(dy => {
      if (dx == 0 && dy == 0)
        return;
      const pos = { x: x + dx, y: y + dy };
      if (pos.x < 0 || pos.x >= columns || pos.y < 0 || pos.y >= rows)
        return;
      const index = pos.y * columns + pos.x;
      aroundPos.push(index);
    })
  })
  return aroundPos;
}

function refreshBoxes(boxes, states) {
  boxes.forEach((b, i) => {
    if (states[i].open) {
      if (states[i].bomb)
        b.innerHTML = '💣';
      else if (states[i].around > 0) {
        b.textContent = states[i].around;
      }
    }else if(states[i].flag){
      b.innerHTML = states[i].flag;
    }else{
      b.textContent = '';
    }
  })
}


function assignBombs(number, clickIndex) {
  const aroundClick = around(clickIndex);
  for (let i = 0; i < number; i++) {
    while (true) {
      const r = Math.floor(Math.random() * states.length);
      if (r!==clickIndex && !states[r].bomb && !aroundClick.some(a => a === r)) {
        states[r].bomb = true;
        break;
      }
    }

  }
}

function computeNumber(states) {
  states.forEach((s, i) => {
    let n = 0;
    around(i).forEach(index => {
      if (states[index].bomb)
        n++;
    })
    s.around = n;
  })

}




function show(i){
  states[i].open = true;
  boxes[i].classList.add('open');
}

function open(i, visited = []) {
  if (states[i].open || visited[i] || states[i].flag)
    return;
  visited[i] = true;
  show(i);

  if(states[i].bomb){
    states.forEach((b, i) => {
      if(b.bomb)
        show(i);
    });
  }else if (states[i].around === 0) {
    around(i).forEach(index => open(index, visited))
  }
  refreshBoxes(boxes, states);

  if(!states.some(b => !b.open && !b.bomb)){
    setTimeout(()=> alert('Congrats !'))
  }
}

let firstTime = true;
for (let i = 0; i < rows*columns; i++) {
  boxes[i] = el('div', {
    className: 'box',
    onclick: () => {
      if (firstTime) {
        assignBombs(bombs, i);
        computeNumber(states);
        firstTime = false;
      }
      open(i);
    },
    oncontextmenu: (e) => {
      e.preventDefault();
      if(!states[i].flag)
        states[i].flag = '🚩';
      else if (states[i].flag === '🚩')
        states[i].flag = '❔';
      else
        states[i].flag = '';
      
      refreshBoxes(boxes, states);
    },
  }, grid);
  states[i] = { open: false, flag: false };
}

refreshBoxes(boxes, states);