const backgroundInput = document.querySelector('.js-backgroundInput')
const backgroundChoose = document.querySelector('.js-background-choose')

backgroundInput.addEventListener('change', (_event) => {
    const reader = new FileReader()

    reader.onload = () => {

      const output = document.getElementById('output')
      output.src = reader.result

      output.onload = () => {

        backgroundChoose.classList.toggle('background-choose--display')
        babyYodaCreator.element.classList.toggle('baby-yoda-creator--display')
                
        const ratio = babyYodaCreator.canvas.height / output.height 
    
        output.width = output.width * ratio
        output.height = babyYodaCreator.canvas.height

        const image = {src: reader.result, posX: 0, posY: 0, width: output.width, height: output.height}

        babyYodaCreator.objects[0] = image

        babyYodaCreator.init()
      }
    }
    reader.readAsDataURL(_event.target.files[0]);
})

/*
* BABY YODA CREATOR CLASS
*/
class BabyYodaCreator {

  constructor(_element, _objects) {

    //Main properties
    this.element = _element
    this.objects = _objects
    this.objects = []
    this.buttonSave = this.element.querySelector('.js-button-save')
    this.buttonReset = this.element.querySelector('.js-button-reset')
    this.canvas = this.element.querySelector('.js-canvas')


    this.canvas.height = window.innerHeight
    this.canvas.width = window.innerWidth - 424
    this.context = this.canvas.getContext('2d')

    this.selectedObject = null
    this.isResizing = false
    
    //object functions
    this.onClickCanvas()
    this.deplaceObject()
    this.downloadCanvas()
    this.itemAddClick()
    this.deleteObject()
    this.reset()
    this.resizeObject()
  }

  //Init function
  init() {
    const babyYoda = {src: 'assets/images/baby1.png', posX: ((this.canvas.width / 2) - 150), posY: ((this.canvas.height / 2) - 150), width: 300, height: 300}
    this.objects.push(babyYoda)
    
    this.loop()
  }

  onClickCanvas() {

    this.canvas.addEventListener('mousedown', (_event) => {

      const bounding = this.canvas.getBoundingClientRect()
      const clickX = _event.clientX - bounding.left
      const clickY = _event.clientY - bounding.top

      this.selectedObject = null
      let currentObject = this.objects.length-1

      while(this.selectedObject == null && currentObject > 0){
        this.selectedObject = null

        //Check if the user click on an object
        if(clickX > this.objects[currentObject].posX && 
          clickX < this.objects[currentObject].posX + this.objects[currentObject].width &&
          clickY > this.objects[currentObject].posY &&
          clickY < this.objects[currentObject].posY + this.objects[currentObject].height) {

            this.selectedObject = currentObject
        } 

        currentObject--
      }
    })
  }

  //If the user move is 
  deplaceObject() {
    let mousedown = false
    let previousCursorX
    let previousCursorY
    let bounding

    window.addEventListener('mousedown', (_event) => {
      bounding = this.canvas.getBoundingClientRect()

      previousCursorX = _event.clientX - bounding.left
      previousCursorY = _event.clientY - bounding.top

      mousedown = true
    })

    window.addEventListener('mouseup', () => {
      mousedown = false
    })

    this.canvas.addEventListener('mousemove', (_event)=> {

      if(this.selectedObject != null && mousedown == true && !this.isResizing) {

        const translateX = (_event.clientX - bounding.left) - previousCursorX
        const translateY = (_event.clientY - bounding.top) - previousCursorY
        //const previousCursorY = _event.clientY - bounding.top
        
        this.objects[this.selectedObject].posX = this.objects[this.selectedObject].posX + translateX
        this.objects[this.selectedObject].posY = this.objects[this.selectedObject].posY + translateY

        previousCursorX = _event.clientX - bounding.left
        previousCursorY = _event.clientY - bounding.top

      }
    })
  }

  //function to resize objects
  resizeObject() {
    let previousCursorX
    let previousCursorY
    let bounding

    window.addEventListener('mousedown', (_event) => {

      if(this.selectedObject != null) {
        bounding = this.canvas.getBoundingClientRect()

        previousCursorX = _event.clientX - bounding.left
        previousCursorY = _event.clientY - bounding.top

        if(this.selectedObject != null &&
          previousCursorX > this.objects[this.selectedObject].posX + this.objects[this.selectedObject].width - 10 &&
          previousCursorX < this.objects[this.selectedObject].posX + this.objects[this.selectedObject].width &&
          previousCursorY < this.objects[this.selectedObject].posY + 10 &&
          previousCursorY > this.objects[this.selectedObject].posY){

          this.isResizing = true
        }
      }
    })

    window.addEventListener('mouseup', () => {
      this.isResizing = false
    })

    this.canvas.addEventListener('mousemove', (_event)=> {

      if(this.selectedObject != null && this.isResizing == true) {

        const ratioX = (_event.clientX - bounding.left) / previousCursorX
        const ratioY = previousCursorY / (_event.clientY - bounding.top)

        const ratio = (ratioX + ratioY) / 2

        this.objects[this.selectedObject].width = this.objects[this.selectedObject].width * ratio
        this.objects[this.selectedObject].height = this.objects[this.selectedObject].height * ratio

        previousCursorX = _event.clientX - bounding.left
        previousCursorY = _event.clientY - bounding.top

      }
    })
  }

  //Draw on the canvas function
  draw() {
    
    for(let i = 0; i < this.objects.length; i++) {

      const object = this.objects[i]
      const image = new Image()

      image.addEventListener('load', () => {

        if(i == this.selectedObject) {

          //create borders
          this.context.strokeStyle = "#5B6FD8"
          this.context.lineWidth = 2
          this.context.strokeRect(object.posX, object.posY, object.width, object.height)

          this.context.fillStyle = "#5B6FD8"

          // //top left
          // this.context.fillRect(object.posX-5, object.posY-5, 10, 10)
          //top right
          this.context.fillRect(object.posX + object.width - 15, object.posY, 15, 15)
          // //bottom right
          // this.context.fillRect(object.posX + object.width - 5, object.posY + object.height - 5, 10, 10)
          // //bottom left
          // this.context.fillRect(object.posX-5, object.posY + object.height - 5, 10, 10)
        }

        this.context.drawImage(image, object.posX, object.posY, object.width, object.height)
      })

      image.src = object.src
    }
  }

  //Function to select the item that the user clicked
  itemAddClick() {
    const itemList = document.querySelectorAll('.item-group__item-list__item')
    
    for(const item of itemList) {
      
      item.addEventListener('click', () => {

        const itemToCreate = {src: item.src, posX: ((this.canvas.width / 2) - 94), posY: ((this.canvas.height / 2) - 94), width: 188, height: 188}
        this.objects.push(itemToCreate)
      })
    }
  }

  //Function to delete the object selected of the canvas
  deleteObject() {

    window.addEventListener('keydown', (_event) => {

      if(_event.code == 'Delete') {

        //We check that there is a selected object and that this object is not baby yoda
        if(this.selectedObject != null && this.selectedObject != 1) {

          this.objects.splice(this.selectedObject, 1)
        }
      }
    })
  }

  //download canvas function
  downloadCanvas() {

    this.buttonSave.addEventListener('click', () => {
      this.selectedObject = null

      this.buttonSave.setAttribute('download', 'baby-yoda.png')
      this.buttonSave.setAttribute('href', this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    })
  }

  //Reset canvas function but keep background
  reset() {

    this.buttonReset.addEventListener('click', () => {

      this.objects[1].posX = (this.canvas.width / 2) - 150
      this.objects[1].posY = (this.canvas.height / 2) - 150
      this.objects[1].width = 300
      this.objects[1].height = 300

      this.objects.splice(2, this.objects.length-2)
    })
  }

  loop() {

    window.requestAnimationFrame(this.loop.bind(this))
    this.draw()
  }
}

babyYodaCreator = new BabyYodaCreator(document.querySelector('.js-baby-yoda-creator'))



