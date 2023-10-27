class afLightbox {
    constructor(opion) {

        this.modal = '';
        this.isiOS = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
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

        if (window.innerWidth <= 480) {
            document.body.classList.add('page-hidden')
        }

        this.modal.querySelector('.af-popup__content').innerHTML = content
        this.modal.querySelector('.af-popup__close').addEventListener('click', function () {
            _this.close()
        })

        if (afterShow) afterShow(this.modal);

        setTimeout(() => {
            this.modal.querySelector(".af-popup").classList.add("af-popup--visible")


            if (this.isiOS) {
                document.documentElement.classList.add('safari-fixed')
                document.body.style.marginTop = `-${ window.scrollY }px`
            }

            documentBody.classList.add('page-hidden')


        }, 10)

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


        if (window.innerWidth <= 480 && document.body.classList.contains('page-hidden')) {
            document.body.classList.remove('page-hidden')
        }

        this.instanse.querySelector('.af-popup').classList.remove('af-popup--visible')

        /*  bodyScrollLock.clearAllBodyScrollLocks(); */

        let documentBody = document.body

        const bodyMarginTop = parseInt(documentBody.style.marginTop, 10)

        if (this.isiOS) {
            if (document.documentElement.classList.contains('safari-fixed')) document.documentElement.classList.remove('safari-fixed')
        }



        documentBody.classList.remove('page-hidden')
        documentBody.style.marginTop = ''

        if (bodyMarginTop || bodyMarginTop === 0) {
            window.scrollTo(0, -bodyMarginTop)
        }

        setTimeout(() => {
            this.instanse.remove()
        }, 300)
    }
}