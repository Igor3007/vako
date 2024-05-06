class afLightbox {
    constructor(opion) {

        this.modal = '';
        this.widthScrollbar = typeof window.getScrollBarWidth == 'undefined' ? 0 : window.getScrollBarWidth()
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

        // if (window.innerWidth <= 480) {
        //     document.body.classList.add('page-hidden')
        // }

        this.modal.querySelector('.af-popup__content').innerHTML = content
        this.modal.querySelector('.af-popup__close').addEventListener('click', function () {
            _this.close()
        })

        if (afterShow) afterShow(this.modal);

        setTimeout(() => {
            this.modal.querySelector(".af-popup").classList.add("af-popup--visible")


            //fix iOS body scroll
            if (this.isiOS) {
                document.body.style.marginTop = `-${ (window.scrollY ) }px`
                document.documentElement.classList.add('safari-fixed')
            }

            document.body.classList.add('page-hidden')

            //compensate scrollbar
            if (this.widthScrollbar > 0) document.body.style.setProperty('margin-right', this.widthScrollbar + 'px')


        }, 10)

        this.createEvent();

    }

    changeContent(content) {
        this.modal.querySelector('.af-popup__content').innerHTML = content
    }

    createEvent() {


        let container = this.instanse.querySelector('.af-popup')
        let state = null

        container.addEventListener('click', (e) => {
            if (!e.target.closest('.af-popup__container') && !container.classList.contains('is-moving')) {
                this.close()
            }
        })

        container.addEventListener('mousedown', (e) => {
            state = true;
        })

        container.addEventListener('mousemove', (e) => {
            if (state) container.classList.add('is-moving')
        })

        container.addEventListener('mouseup', (e) => {
            state = false;
            setTimeout(() => {
                if (container.classList.contains('is-moving')) container.classList.remove('is-moving')
            }, 100)
        })
    }

    close() {

        this.instanse.querySelector('.af-popup').classList.remove('af-popup--visible')
        let documentBody = document.body

        if (this.isiOS) {
            if (document.documentElement.classList.contains('safari-fixed')) document.documentElement.classList.remove('safari-fixed')
            const bodyMarginTop = parseInt(documentBody.style.marginTop, 10)
            documentBody.style.marginTop = ''
            if (bodyMarginTop || bodyMarginTop === 0) window.scrollTo(0, -bodyMarginTop)
        }

        //compensate scrollbar
        document.body.classList.remove('page-hidden')
        document.body.style.removeProperty('margin-right')


        setTimeout(() => {
            this.instanse.remove()
        }, 500)
    }
}