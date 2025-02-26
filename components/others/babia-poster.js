if (typeof AFRAME === 'undefined') {
  throw new Error(
    'Component attempted to register before AFRAME was available.'
  );
}

/**
 * Poster Popup component for A-Frame.
 */
AFRAME.registerComponent('babia-poster', {
  schema: {
    title: {
      type: 'string',
      default: 'New Poster'
    },
    titleColor: {
      type: 'string',
      default: 'black'
    },
    titleFont: {
      type: 'string',
      default: 'mozillavr'
    },
    titleWrapCount: {
      type: 'number',
      default: 24
    },
    body: {
      type: 'string',
      default: 'This poster has no body yet.'
    },
    bodyColor: {
      type: 'string',
      default: 'black'
    },
    bodyFont: {
      type: 'string',
      default: 'mozillavr'
    },
    bodyWrapCount: {
      type: 'number',
      default: 30
    },
    openOn: {
      type: 'string',
      default: 'click'
    },
    active: {
      type: 'boolean',
      default: true,
    },
    openIconImage: {
      type: 'asset',
      default: ''
    },
    openIconRadius: {
      type: 'number',
      default: 0.3
    },
    openIconColor: {
      type: 'string',
      default: 'white'
    },
    closeIconImage: {
      type: 'asset',
      default: ''
    },
    closeIconRadius: {
      type: 'number',
      default: 0.3
    },
    closeIconColor: {
      type: 'string',
      default: 'white'
    },
    image: {
      type: 'string',
      default: ''
    },
    imageWidth: {
      type: 'number',
      default: 2
    },
    imageHeight: {
      type: 'number',
      default: 2
    },
    posterBoxWidth: {
      type: 'number',
      default: 4
    },
    posterBoxHeight: {
      type: 'number',
      default: 4
    },
    posterBoxColor: {
      type: 'string',
      default: 'white'
    },
    posterBoxPadding: {
      type: 'number',
      default: 0.2
    }
  },
  multiple: true,
  posterPlaneEl: null,
  closeIconEl: null,
  titleEl: null,
  bodyEl: null,
  imageEl: null,
  hasImage: false,
  /**
   * Spawns the entities required to support this poster.
   */
  init() {
    this.cameraEl = document.querySelector('[camera]');
    this.generateOpenIcon()
    this.spawnEntities();
    this.el.emit('loaded');
  },
  /**
   * If the component is open, ensure it always faces the camera.
   */
  tick() {
    if (this.isOpen) {
      this.positionPosterPlane();
    }
  },
  /**
   * When this component is removed, destruct event listeners.
   */
  remove() {
    const { openOn } = this.data;
    this.el.removeEventListener(
      openOn,
      this.togglePosterOpen.bind(this)
    );
    this.closeIconEl.removeEventListener(
      openOn,
      this.togglePosterOpen.bind(this)
    );
  },
  /**
   * When this component is updated, re-calculate title, body, image, and
   * poster plane to incorporate changes.
   */
  update() {
    this.generateTitle();
    this.generateBody();
    this.generateImage();
  },
  /**
   * Handles opening and closing the poster plane.
   */
  togglePosterOpen(event) {
    // If the close icon is clicked, close the poster.
    if (event.target.getAttribute('id') === `${this.el.getAttribute('id')}--close-icon`) {
      this.posterPlaneEl.setAttribute('visible', false);
      this.isOpen = false;
    }

    // If the open icon is clicked, and the poster is active, open the poster.
    if (this.data.active && event.target.getAttribute('id') === this.el.getAttribute('id')) {
      this.positionPosterPlane();
      this.posterPlaneEl.setAttribute('visible', true);
      this.isOpen = true;
    }
  },
  /**
   * Generates the open icon.
   */
  generateOpenIcon() {
    const {
      openIconRadius: radius,
      openIconColor: color,
      openIconImage: src,
      openOn
    } = this.data;

    this.el.setAttribute('geometry', {
      primitive: 'circle',
      radius
    });
    this.el.setAttribute('material', {
      color,
      src
    });

    this.el.addEventListener(openOn, this.togglePosterOpen.bind(this));
  },
  /**
   * Generates the close icon.
   */
  generateCloseIcon() {
    const {
      closeIconRadius: radius,
      closeIconColor: color,
      closeIconImage: src,
      posterBoxWidth: width,
      posterBoxHeight: height,
      openOn
    } = this.data;

    const closeIcon = document.createElement('a-entity');
    closeIcon.setAttribute('id', `${this.el.getAttribute('id')}--close-icon`);
    closeIcon.setAttribute('position', {
      x: width / 2,
      y: height / 2,
      z: 0.01
    });
    closeIcon.setAttribute('geometry', {
      primitive: 'circle',
      radius
    });
    closeIcon.setAttribute('material', {
      color,
      src
    });

    closeIcon.addEventListener(openOn, this.togglePosterOpen.bind(this));

    this.closeIconEl = closeIcon;
    return closeIcon;
  },
  /**
   * Generates the title text.
   */
  generateTitle() {
    const {
      title: value,
      titleColor: color,
      titleFont: font,
      titleWrapCount: wrapCount,
      posterBoxWidth: width,
      posterBoxHeight: height,
      posterBoxPadding: padding,
      imageHeight
    } = this.data;

    const title = this.titleEl || document.createElement('a-entity');
    title.setAttribute('id', `${this.el.getAttribute('id')}--title`);
    title.setAttribute('text', {
      value: value.substring(0, wrapCount),
      color,
      font,
      wrapCount,
      width: width - padding * 2,
      baseline: 'top',
      anchor: 'left'
    });

    let y = height / 2 - padding;
    if (this.hasImage) {
      y -= imageHeight / 2;
    }

    title.setAttribute('position', {
      x: -(width / 2) + padding,
      y,
      z: 0.01
    });

    this.titleEl = title;
    return title;
  },
  /**
   * Generates the body text entity.
   */
  generateBody() {
    const {
      body: value,
      bodyColor: color,
      bodyFont: font,
      bodyWrapCount: wrapCount,
      posterBoxWidth: width,
      posterBoxHeight: height,
      posterBoxPadding: padding,
      imageHeight
    } = this.data;

    const body = this.bodyEl || document.createElement('a-entity');
    body.setAttribute('id', `${this.el.getAttribute('id')}--title`);
    body.setAttribute('text', {
      value,
      color,
      font,
      wrapCount,
      width: width - padding * 2,
      baseline: 'top',
      anchor: 'left'
    });

    let y = height / 2 - padding * 3;
    if (this.hasImage) {
      y -= imageHeight / 2;
    }

    body.setAttribute('position', {
      x: -(width / 2) + padding,
      y,
      z: 0.01
    });

    this.bodyEl = body;
    return body;
  },
  /**
   * Generates the image entity.
   */
  generateImage() {
    const {
      image: src,
      imageWidth: width,
      imageHeight: height,
      posterBoxHeight
    } = this.data;

    if (!src.length) {
      return null;
    }

    const image = this.imageEl || document.createElement('a-image');
    image.setAttribute('id', `${this.el.getAttribute('id')}--image`);
    image.setAttribute('src', src);
    image.setAttribute('width', width);
    image.setAttribute('height', height);
    image.setAttribute('position', {
      x: 0,
      y: posterBoxHeight / 2,
      z: 0.01
    });

    this.hasImage = true;
    this.imageEl = image;
    return image;
  },
  /**
   * Generates the poster plane.
   */
  generatePosterPlane() {
    const {
      posterBoxWidth: width,
      posterBoxHeight: height,
      posterBoxPadding: padding,
      posterBoxColor: color
    } = this.data;

    const plane = this.posterPlaneEl || document.createElement('a-entity');
    plane.setAttribute('id', `${this.el.getAttribute('id')}--poster-plane`);
    plane.setAttribute('position', { x: 0, y: 0, z: 0.5 });
    plane.setAttribute('visible', false);
    plane.setAttribute('geometry', {
      primitive: 'plane',
      width: width + padding,
      height: height + padding
    });

    const image = this.generateImage();
    if (image) {
      plane.appendChild(this.generateImage());
    }

    plane.setAttribute('material', { color });
    plane.appendChild(this.generateCloseIcon());
    plane.appendChild(this.generateTitle());
    plane.appendChild(this.generateBody());

    this.posterPlaneEl = plane;

    return plane;
  },
  positionPosterPlane() {
    if (this.posterPlaneEl && this.cameraEl) {
      const cameraWorldPos = new THREE.Vector3();
      this.cameraEl.object3D.getWorldPosition(cameraWorldPos);

      const vector = this.posterPlaneEl.object3D.parent.worldToLocal(cameraWorldPos);
      this.posterPlaneEl.object3D.lookAt(vector);
    }
  },
  spawnEntities() {
    this.el.appendChild(this.generatePosterPlane());
  }
});