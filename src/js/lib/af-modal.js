class customModal {
    constructor(opion) {

        this.modal = '';
        if (opion) {
            this.mobileBottom = (opion.mobileInBottom ? opion.mobileInBottom : false)
        }
    }

    init() {
        //this.createTemplate()
    }

    createTemplate() {
        let template = document.createElement('div')
        template.innerHTML = `
                <div class="af-popup">
                    <div class="af-popup__bg"></div>
                    <div class="af-popup__wrp">
                        <div class="af-popup__container">
                            <div class="af-popup__close">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"></path></svg>
                            </div>
                            <div class="af-popup__content"></div>
                        </div>
                    </div>
                </div>
                `

        document.body.append(template)
        this.instanse = template;

        return template;
    }

    open(content, afterShow) {

        let _this = this;
        this.modal = this.createTemplate();

        if (window.innerWidth <= 480 && this.mobileBottom) {
            this.modal.querySelector(".af-popup").classList.add("af-popup--mobile")
        }

        this.modal.querySelector('.af-popup__content').innerHTML = content
        this.modal.querySelector('.af-popup__close').addEventListener('click', function () {
            _this.close()
        })

        if (afterShow) afterShow(this.modal);

        this.createEvent();

    }

    changeContent(content) {
        this.modal.querySelector('.af-popup__content').innerHTML = content
    }

    createEvent() {

        let _this = this

        this.instanse.querySelector('.af-popup').addEventListener('click', function () {
            _this.close()
        })
        this.instanse.querySelector('.af-popup__container').addEventListener('click', function (event) {
            event.stopPropagation(true)
        })
    }

    close() {
        this.instanse.remove()
    }
}