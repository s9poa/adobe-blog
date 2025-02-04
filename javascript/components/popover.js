// Popover Structure and Class Details:
// .popover         - Wrapper
// .popover_a       - <button>
// .popover_b       - data-popover-type="popover" | data-popover-type="dialog"
// .popover_b_close - <button> with aria-label="Close menu"
// .popover_b_overlay - <div id="#" class="popover_b_overlay"></div> | popover_b needs .has_overlay + data-overlay-target="#ID"
// .popover_a.popoverActiveColor - Sets the active styling for popover_a

document.addEventListener('DOMContentLoaded', () => {
  const subPopoverDisplay = 'grid'
  const popovers = document.querySelectorAll('.popover')
  const focusableSelectors = 'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])'
  let lastUserInputMethod = 'mouse'
  let openPopovers = []

  document.addEventListener('keydown', () => (lastUserInputMethod = 'keyboard'))
  document.addEventListener('mousedown', () => (lastUserInputMethod = 'mouse'))

  const showOverlay = (selector) => {
    document.querySelectorAll('.popover_b_overlay').forEach(o => (o.style.display = 'none'))
    if (selector) {
      const overlay = document.querySelector(selector)
      if (overlay) {
        overlay.style.display = 'block'
        document.body.style.overflow = 'hidden'
      }
    } else {
      document.body.style.overflow = ''
    }
  }

  const hideAllOverlays = () => {
    document.querySelectorAll('.popover_b_overlay').forEach(o => (o.style.display = 'none'))
    document.body.style.overflow = ''
  }

  const updateOverlayState = () => {
    const overlayPopover = [...openPopovers].reverse().find(e => e.overlayNeeded)
    if (overlayPopover) showOverlay(overlayPopover.overlaySelector)
    else hideAllOverlays()
  }

  const trapFocusHandler = (e) => {
    if (e.key !== 'Tab') return
    if (openPopovers.length === 0) return
    const topEntry = openPopovers[openPopovers.length - 1]
    const focusableElements = topEntry.focusableElements
    if (!focusableElements || !focusableElements.length) return
    const first = focusableElements[0]
    const last = focusableElements[focusableElements.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const applyFocusTrap = () => {
    document.removeEventListener('keydown', trapFocusHandler)
    if (openPopovers.length > 0) {
      document.addEventListener('keydown', trapFocusHandler)
    }
  }

  const isNestedPopover = (popover) => {
    return popover.closest('.popover_b') && popover.closest('.popover_b') !== popover
  }

  const announceDialog = (action) => {
    const announcement = document.getElementById('dialog-announcement')
    if (announcement) announcement.textContent = `Dialog ${action}`
  }

  const closeAllPopovers = () => {
    let lastTriggeredButton = null
    while (openPopovers.length > 0) {
      const topEntry = openPopovers.pop()
      const { popover, trigger, type } = topEntry
      const pb = popover.querySelector('.popover_b')
      const pa = popover.querySelector('.popover_a')
      if (pb) {
        pb.style.display = 'none'
        pb.setAttribute('aria-hidden', 'true')
      }
      if (pa) {
        pa.setAttribute('aria-expanded', 'false')
        pa.classList.remove('popoverActiveColor')
      }
      lastTriggeredButton = trigger || lastTriggeredButton
      if (type === 'dialog') announceDialog('closed')
    }
    hideAllOverlays()
    applyFocusTrap()
    if (lastTriggeredButton) lastTriggeredButton.focus()
  }

  const closeTopPopover = () => {
    if (openPopovers.length === 0) return
    const topEntry = openPopovers.pop()
    const { popover, trigger, type } = topEntry
    const pb = popover.querySelector('.popover_b')
    const pa = popover.querySelector('.popover_a')
    if (pb) {
      pb.style.display = 'none'
      pb.setAttribute('aria-hidden', 'true')
    }
    if (pa) {
      pa.setAttribute('aria-expanded', 'false')
      pa.classList.remove('popoverActiveColor')
    }
    updateOverlayState()
    applyFocusTrap()
    if (trigger && trigger.isConnected) trigger.focus()
    if (type === 'dialog') announceDialog('closed')
  }

  const closeAllNestedPopovers = () => {
    for (let i = openPopovers.length - 1; i >= 0; i--) {
      const topEntry = openPopovers[i]
      const { popover } = topEntry
      if (isNestedPopover(popover)) {
        const pb = popover.querySelector('.popover_b')
        const pa = popover.querySelector('.popover_a')
        if (pb) {
          pb.style.display = 'none'
          pb.setAttribute('aria-hidden', 'true')
        }
        if (pa) {
          pa.setAttribute('aria-expanded', 'false')
          pa.classList.remove('popoverActiveColor')
        }
        openPopovers.splice(i, 1)
      }
    }
    updateOverlayState()
    applyFocusTrap()
  }

  function getDirectChildCloseButton(pb) {
    const children = pb.children
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains('popover_b_close')) return children[i]
    }
    return null
  }

  function activateNestedOpenPopovers(container) {
    const subPopovers = container.querySelectorAll('.popover_b')
    subPopovers.forEach(childPb => {
      if (window.getComputedStyle(childPb).display !== 'none') {
        const childPbClasses = [...childPb.classList].filter(c => c !== 'popover_b')
        childPbClasses.forEach(cls => {
          const matchingTrigger = container.querySelector(`.popover_a.${cls}`)
          if (matchingTrigger) {
            matchingTrigger.classList.add('popoverActiveColor')
            matchingTrigger.setAttribute('aria-expanded', 'true')
          }
        })
      }
    })
  }

  popovers.forEach((p, index) => {
    const pa = p.querySelector('.popover_a')
    const pb = p.querySelector('.popover_b')
    if (!pb || !pa) return
    let closeBtn = getDirectChildCloseButton(pb)
    const popoverType = pb.dataset.popoverType || 'popover'
    if (popoverType === 'dialog') {
      pb.setAttribute('role', 'dialog')
      pb.setAttribute('aria-modal', 'true')
      const title = pb.querySelector('.dialog-title')
      const description = pb.querySelector('.dialog-description')
      if (title) {
        const titleId = title.id || `dialog-title-${index}`
        title.id = titleId
        pb.setAttribute('aria-labelledby', titleId)
      }
      if (description) {
        const descId = description.id || `dialog-description-${index}`
        description.id = descId
        pb.setAttribute('aria-describedby', descId)
      }
    } else {
      pb.setAttribute('role', 'tooltip')
    }
    if (!pb.id) pb.id = `popover_b_${index}`
    pa.setAttribute('aria-controls', pb.id)
    if (window.getComputedStyle(pb).display !== 'none') {
      pa.setAttribute('aria-expanded', 'true')
      pa.classList.add('popoverActiveColor')
      pb.setAttribute('aria-hidden', 'false')
      const focusableElements = Array.from(pb.querySelectorAll(focusableSelectors))
      const overlayNeeded = pb.classList.contains('has_overlay')
      const overlaySelector = pb.getAttribute('data-overlay-target') || null
      openPopovers.push({
        popover: p,
        trigger: pa,
        overlayNeeded,
        overlaySelector,
        focusableElements,
        type: popoverType
      })
      updateOverlayState()
      applyFocusTrap()
      activateNestedOpenPopovers(pb)
    } else {
      pa.setAttribute('aria-expanded', 'false')
      pb.setAttribute('aria-hidden', 'true')
      pa.classList.remove('popoverActiveColor')
    }
    pa.addEventListener('click', (e) => {
      e.stopPropagation()
      const isRoot = !pb.parentElement.closest('.popover_b')
      const isOpen = pa.getAttribute('aria-expanded') === 'true'
      if (isRoot) {
        if (isOpen) {
          closeAllPopovers()
          return
        } else {
          closeAllPopovers()
        }
      } else {
        if (isOpen) {
          const topEntry = openPopovers[openPopovers.length - 1]
          if (topEntry && topEntry.popover === p) closeTopPopover()
          return
        } else {
          closeAllNestedPopovers()
        }
      }
      pb.style.display = 'flex'
      pa.setAttribute('aria-expanded', 'true')
      pa.classList.add('popoverActiveColor')
      pb.setAttribute('aria-hidden', 'false')
      const focusableElements = Array.from(pb.querySelectorAll(focusableSelectors))
      const overlayNeeded = pb.classList.contains('has_overlay')
      const overlaySelector = pb.getAttribute('data-overlay-target') || null
      openPopovers.push({
        popover: p,
        trigger: pa,
        overlayNeeded,
        overlaySelector,
        focusableElements,
        type: popoverType
      })
      updateOverlayState()
      applyFocusTrap()
      if (popoverType === 'dialog' && lastUserInputMethod === 'keyboard' && focusableElements.length > 0) {
        focusableElements[0].focus()
        announceDialog('opened')
      } else if (lastUserInputMethod === 'keyboard' && focusableElements.length > 0) {
        focusableElements[0].focus()
      }
      activateNestedOpenPopovers(pb)
    })
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const isRoot = !pb.parentElement.closest('.popover_b')
        if (isRoot) {
          closeAllPopovers()
        } else {
          closeTopPopover()
        }
        if (popoverType === 'dialog') announceDialog('closed')
      })
    }
    pb.addEventListener('click', (e) => {
      e.stopPropagation()
      const clickedTrigger = e.target.closest('.popover_a')
      if (clickedTrigger) {
        let subClasses = [...clickedTrigger.classList].filter(cls => cls !== 'popover_a')
        if (subClasses.length > 0) {
          const allTriggers = pb.querySelectorAll('.popover_a')
          allTriggers.forEach(t => {
            t.classList.remove('popoverActiveColor')
          })
          clickedTrigger.classList.add('popoverActiveColor')
          const allPopovers = pb.querySelectorAll('.popover_b')
          allPopovers.forEach(sub => {
            sub.style.display = 'none'
          })
          let match = null
          for (let i = 0; i < subClasses.length; i++) {
            let checkClass = subClasses[i]
            let found = pb.querySelector('.popover_b.' + checkClass)
            if (found) {
              match = found
              break
            }
          }
          if (match) match.style.display = subPopoverDisplay
        }
      }
    })
  })

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.popover')) {
      closeAllPopovers()
    } else if (e.target.classList.contains('popover_b_overlay')) {
      closeAllPopovers()
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTopPopover()
    }
  })
})
