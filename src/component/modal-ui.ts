import { Unsubscriber } from '../event'
import { IPhotoFlexOp } from '../photo-flex-operation'
import { dom } from '../util'

export class ModalUI extends HTMLElement {
  private _unsub?: Unsubscriber
  private _visible: boolean = false
  constructor(readonly op: IPhotoFlexOp) {
    super()
  }
  private get _modalEl(): HTMLElement {
    return this.querySelector('.content')!
  }
  private get _dimmerEl(): HTMLElement {
    return this.querySelector('.dimmer')!
  }
  private clear(): void {
    dom.remove(this._modalEl, this._dimmerEl)
  }
  bindTo(container: HTMLElement) {
    container.appendChild(this)
  }
  connectedCallback() {}
  show(content: HTMLElement) {
    dom.creates<ModalUI>(this, '.modal.dimmer', '.modal.content')
    this._visible = true
    setTimeout(() => {
      ;[this._dimmerEl, this._modalEl].forEach((el) =>
        el.classList.add('visible')
      )
      this._modalEl.appendChild(content)
      this._unsub = dom.event.on(this._dimmerEl, 'click', () => {
        this.hide()
      })
    })
  }
  hide() {
    if (!this._visible) {
      return
    }
    dom.event.transition([this._dimmerEl, this._modalEl], {
      trigger: (el) => (el.style.opacity = '0'),
      end: (el: HTMLElement, _, done) => {
        el.style.opacity = ''
        el.classList.remove('visible')
        dom.emptify(el)
        if (done) {
          this.clear()
        }
      },
    })

    if (this._unsub) {
      this._unsub()
    }
    delete this._unsub
    this._visible = false
  }
}

customElements.define('modal-ui', ModalUI)
