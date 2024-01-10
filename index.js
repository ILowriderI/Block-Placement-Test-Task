const containerElement = document.getElementById("container");
const info = document.getElementById('info');
let container = { width: 350, height: 300 };

const fillInfo = (width, height, fullness) => {
  info.innerHTML = ""; 
  info.innerHTML += `Width: ${width}px <br>`;
  info.innerHTML += `Height: ${height}px <br>`;
  info.innerHTML += `Fullness: ${fullness} <br>`;
};

const efficientBlockPlacement = (blocks, container) => {
  const blocksWithOrder = blocks
    .map((block, index) => ({ ...block, initialOrder: index }))
    .sort((a, b) => b.width * b.height - a.width * a.height);

  const blockCoordinates = [];
  let innerEmptyArea = container.width * container.height; 

  const isOverlap = (block, coordinates) =>
    coordinates.some(
      (coord) =>
        block.right > coord.left &&
        block.left < coord.right &&
        block.bottom > coord.top &&
        block.top < coord.bottom
    );

  const rotateBlock = (block, angle) => {
    const rotatedBlock = { ...block };
    if (angle === 90 || angle === 270) {
      rotatedBlock.width = block.height;
      rotatedBlock.height = block.width;
    }
    return rotatedBlock;
  };

  blocksWithOrder.forEach((block) => {
    let placed = false;

    for (let angle = 0; angle <= 270 && !placed; angle += 90) {
      const rotatedBlock = rotateBlock(block, angle);

      for (let x = 0; x <= container.width - rotatedBlock.width && !placed; x++) {
        for (let y = 0; y <= container.height - rotatedBlock.height && !placed; y++) {
          rotatedBlock.left = x;
          rotatedBlock.top = y;
          rotatedBlock.right = x + rotatedBlock.width;
          rotatedBlock.bottom = y + rotatedBlock.height;

          if (!isOverlap(rotatedBlock, blockCoordinates)) {
            blockCoordinates.push({
              ...rotatedBlock,
              initialOrder: block.initialOrder,
            });
            innerEmptyArea -=
              (rotatedBlock.right - rotatedBlock.left) *
              (rotatedBlock.bottom - rotatedBlock.top);
            placed = true;
          }
        }
      }
       if (!placed && angle === 270) {
        throw new Error("Blocks cannot be placed in a container of this size");
      }
    }
  });

  const fullness = 1 - innerEmptyArea / (container.width * container.height);
 fillInfo(container.width,container.height,fullness);
  return {
    fullness,
    blockCoordinates,
  };
};



const getBlocksFromJson = async () => {
  try {
    const response = await fetch("blocks.json");
    return await response.json();
  } catch (error) {
    console.error("Error loading blocks:", error);
    return [];
  }
};


const displayBlocks = (coordinates, blockIndices) => {
 
  containerElement.innerHTML = "";

  const colorMap = {};

  coordinates.forEach((coord, index) => {
    const blockElement = document.createElement("div");
    const initialOrder = document.createElement("div");

    blockElement.className = "block";
    blockElement.style.cssText = `width: ${coord.right - coord.left}px;
                                  height: ${coord.bottom - coord.top}px;
                                  top: ${coord.top}px;
                                  left: ${coord.left}px;`;

    const originalIndex = blockIndices[index];
    initialOrder.className = "initial_order";
    
    initialOrder.textContent = originalIndex.toString();

    blockElement.appendChild(initialOrder);

    containerElement.style.cssText = `width: ${container.width}px;
                                      height: ${container.height}px;`;

    const blockKey = `${blockElement.style.width}-${blockElement.style.height}`;
    colorMap[blockKey] = colorMap[blockKey] || getRandomColor();

    blockElement.style.backgroundColor = colorMap[blockKey];
    containerElement.appendChild(blockElement);
  });
};

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  return ("#" +Array.from( { length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join(""));
};

const run = async () => {
  try {
    const blocks = await getBlocksFromJson();
    const result = efficientBlockPlacement(blocks, container);

    console.log("Fullness:", result.fullness);

    displayBlocks(
      result.blockCoordinates,
      result.blockCoordinates.map((coord) => coord.initialOrder)
    );
  } catch (error) {
    console.log("Blocks cannot be placed in a container of this size")
    showErrorMessage();
   
  }
};


const updateWidth = () => {
  container.width = parseInt(document.getElementById("width").value);
  run();
};
const updateHeight = () => {
  container.height = parseInt(document.getElementById("height").value);
  run();
};


const downloadJsonFile = async () => {
  try {
    const blocks = await getBlocksFromJson(); 

    const result = efficientBlockPlacement(blocks, container);
    const jsonData = {
      fullness: result.fullness,
      blockCoordinates: result.blockCoordinates,
    };
    const jsonString = JSON.stringify(jsonData, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'block_placement_data.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading JSON file:', error);
  }
};
const showErrorMessage = () =>{
  const shrugEmoji = '\u{1F937}';
  const message = document.createElement('div');
  message.className = 'error_message';
  containerElement.innerHTML = "";
  message.textContent = 
  `Something went wrong blocks cannot be placed in a container of this size.${shrugEmoji}  Please change the parameters of the container .`;
  containerElement.appendChild(message);
  info.innerText = shrugEmoji;

} 

  document.getElementById("btn").addEventListener("click", downloadJsonFile);
  document.getElementById("width").addEventListener("blur", updateWidth);
  document.getElementById("height").addEventListener("blur", updateHeight);
  
  run();




