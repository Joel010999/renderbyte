document.addEventListener('DOMContentLoaded', () => {

    // Observer for fade-in/slide-up elements
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Optional: stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animateElements = document.querySelectorAll('.project-item, .price-card, .hero-section h1');

    animateElements.forEach(el => {
        el.classList.add('reveal-pending'); // Add CSS class to hide initially
        observer.observe(el);
    });

    // --- SPLIT TEXT ANIMATION LOGIC ---
    function splitText(element, type = 'word') {
        const originalContent = Array.from(element.childNodes);
        element.textContent = ''; // Clear content to rebuild

        let globalIndex = 0;

        originalContent.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                // Preserve spaces: divide by space but keep them or use a safer split
                // If we perform trim() we lose leading/trailing spaces of the node
                const words = text.split(/(\s+)/); // Split by whitespace capturing it

                words.forEach(word => {
                    if (word.trim().length > 0) {
                        // It's a word
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.classList.add('split-word');
                        span.style.setProperty('--index', globalIndex++);
                        element.appendChild(span);
                    } else {
                        // It's whitespace
                        element.appendChild(document.createTextNode(word));
                    }
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // If it's a BR or other element, keep it
                const clone = node.cloneNode(true);
                element.appendChild(clone);
            }
        });

        element.classList.add('split-text-container');
    }

    // Apply split text to Service Titles and Descriptions
    const serviceTitles = document.querySelectorAll('.service-title');
    const serviceDescriptions = document.querySelectorAll('.service-desc p');

    serviceTitles.forEach(title => splitText(title, 'word'));
    serviceDescriptions.forEach(desc => splitText(desc, 'word'));


    // 3D Cube Rotation (Sticky Connection)
    const cube = document.getElementById('heroCube');
    const heroSection = document.querySelector('.hero-section');

    // Services Horizontal Scroll Interaction
    const servicesSection = document.getElementById('servicios');
    const horizontalTrack = document.querySelector('.horizontal-track');

    if (servicesSection && horizontalTrack) {
        window.addEventListener('scroll', () => {
            // Check if mobile (vertical layout)
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                // On mobile, we just check visibility based on vertical scroll
                checkServiceVisibility();
                return;
            }

            const sectionTop = servicesSection.offsetTop;
            const sectionHeight = servicesSection.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollY = window.scrollY;

            // Distance scrolled *within* the section
            let distanceIn = scrollY - sectionTop;

            // Total distance to scroll horizontally
            const maxScroll = sectionHeight - viewportHeight;

            // Percentage (0 to 1)
            let percent = distanceIn / maxScroll;
            if (percent < 0) percent = 0;
            if (percent > 1) percent = 1;

            // How much to move the track
            const trackWidth = horizontalTrack.scrollWidth;
            const moveAmount = trackWidth - window.innerWidth;

            if (moveAmount > 0) {
                const x = -percent * moveAmount;
                horizontalTrack.style.transform = `translateX(${x}px)`;

                checkServiceVisibility();
            }
        });

        // Check visibility on load and resize too
        function checkServiceVisibility() {
            const serviceItems = document.querySelectorAll('.service-item');
            const isMobile = window.innerWidth < 768;

            serviceItems.forEach(item => {
                const rect = item.getBoundingClientRect();

                let isVisible = false;

                if (isMobile) {
                    // Vertical visibility check
                    // Allow it to activate when top enters the bottom 25% of screen
                    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
                        isVisible = true;
                    }
                } else {
                    // Horizontal visibility check
                    if (rect.left < window.innerWidth * 0.75 && rect.right > 0) {
                        isVisible = true;
                    }
                }

                if (isVisible) {
                    item.classList.add('active');
                }
            });
        }

        // Run once on init to reveal first item if visible
        checkServiceVisibility();
    }

    // 3D Cube Rotation & Background Switch
    if (cube && heroSection) {
        let scrollRotY = 0;
        let scrollRotX = 0;
        let mouseRotY = 0;
        let mouseRotX = 0;

        const stickyContainer = document.querySelector('.sticky-container');
        const heroVideo = document.getElementById('hero-video');
        const sideralVideo = document.getElementById('sideral-video');
        const metaVideo = document.getElementById('meta-video');
        const luihVideo = document.getElementById('luih-video');

        // Define backgrounds for faces
        // 0-90: Front (RenderByte)
        // 90-180: Left (Sideral)

        function updateBackground(totalAngle, rotX) {
            // Check for Top Face
            if (rotX <= -20) {
                stickyContainer.style.backgroundImage = "url('assets/hero_bg_nuevosiglo.png')";
                if (heroVideo) {
                    heroVideo.classList.remove('video-active');
                    heroVideo.pause();
                }
                if (sideralVideo) {
                    sideralVideo.classList.remove('video-active');
                    sideralVideo.pause();
                }
                if (metaVideo) {
                    metaVideo.classList.remove('video-active');
                    metaVideo.pause();
                }
                if (luihVideo) {
                    luihVideo.classList.remove('video-active');
                    luihVideo.pause();
                }
                return;
            }

            // Normalize angle to 0-360
            let angle = totalAngle % 360;
            if (angle < 0) angle += 360;

            let isFrontFace = false;
            let isSideralFace = false;
            let isMetaFace = false;
            let isLuihFace = false;

            // ANGLE MAPPING:
            // 0   (315-45)  = Front (RenderByte)
            // 90  (45-135)  = Left (Sideral)  
            // 180 (135-225) = Back (Meta)
            // 270 (225-315) = Right (Luih)

            if (angle >= 45 && angle < 135) {
                // 90deg Range -> Left Face (Sideral) is visible
                isSideralFace = true;
                stickyContainer.style.backgroundImage = 'none';
                stickyContainer.style.backgroundColor = 'transparent'; // Ensure transparency
            } else if (angle >= 135 && angle < 225) {
                // 180deg Range -> Back Face (Meta)
                isMetaFace = true;
                stickyContainer.style.backgroundImage = 'none';
                stickyContainer.style.backgroundColor = 'transparent'; // Ensure transparency
            } else if (angle >= 225 && angle < 315) {
                // 270deg Range -> Right Face (Luih)
                isLuihFace = true;
                stickyContainer.style.backgroundImage = 'none';
                stickyContainer.style.backgroundColor = 'transparent'; // Ensure transparency
            } else {
                // 0deg Range -> Front Face (RenderByte)
                isFrontFace = true;
                stickyContainer.style.backgroundImage = 'none';
                stickyContainer.style.backgroundColor = 'transparent'; // Ensure transparency
            }

            if (heroVideo && sideralVideo && metaVideo && luihVideo) {
                // Front Face Logic (RenderByte / Nuevo Siglo)
                if (isFrontFace) {
                    // Check if we are in the second half of rotation (Nuevo Siglo)
                    if (scrollRotY > 180) {
                        // Show Nuevo Siglo Background
                        stickyContainer.style.backgroundImage = "url('assets/nuevosiglo_bg.png')";
                        stickyContainer.style.backgroundColor = ''; // Reset
                        heroVideo.classList.remove('video-active');
                        heroVideo.pause();
                    } else {
                        // Show RenderByte Video
                        stickyContainer.style.backgroundImage = 'none';
                        stickyContainer.style.backgroundColor = 'transparent';
                        heroVideo.classList.add('video-active');
                        if (heroVideo.paused) {
                            heroVideo.muted = true;
                            heroVideo.play().catch(e => console.log("Auto-play prevented", e));
                        }
                    }
                } else {
                    heroVideo.classList.remove('video-active');
                    heroVideo.pause();
                }

                // Sideral Face Logic
                if (isSideralFace) {
                    sideralVideo.classList.add('video-active');
                    if (sideralVideo.paused) {
                        sideralVideo.muted = true; // Ensure muted for autoplay
                        sideralVideo.play().catch(e => console.log("Auto-play prevented", e));
                    }
                } else {
                    sideralVideo.classList.remove('video-active');
                    sideralVideo.pause();
                }

                // Meta Face Logic
                if (isMetaFace) {
                    metaVideo.classList.add('video-active');
                    if (metaVideo.paused) {
                        metaVideo.muted = true; // Ensure muted for autoplay
                        metaVideo.play().catch(e => console.log("Auto-play prevented", e));
                    }
                } else {
                    metaVideo.classList.remove('video-active');
                    metaVideo.pause();
                }

                // Luih Face Logic
                if (isLuihFace) {
                    luihVideo.classList.add('video-active');
                    if (luihVideo.paused) {
                        luihVideo.muted = true;
                        luihVideo.play().catch(e => console.log("Auto-play prevented", e));
                    }
                } else {
                    luihVideo.classList.remove('video-active');
                    luihVideo.pause();
                }
            }
        }

        function updateCubeTransform() {
            // Combine scroll and mouse rotations
            const totalRotY = scrollRotY + mouseRotY;
            const totalRotX = -scrollRotX - mouseRotX;
            cube.style.transform = `rotateX(${totalRotX}deg) rotateY(${totalRotY}deg)`;

            updateBackground(totalRotY, totalRotX);
        }

        // Scroll Interaction
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = heroSection.offsetHeight;
            const windowHeight = window.innerHeight;

            // Calculate progress based on available scroll track
            if (scrollY <= heroHeight) {
                let progress = scrollY / (heroHeight - windowHeight);
                if (progress < 0) progress = 0;

                // Logic: 
                // Rotate Y from 0 to 360.
                // At 0: Front is RenderByte
                // At 360: Front is Final Image
                // Swap happens when Front is hidden (e.g. at 180deg)

                scrollRotY = progress * 360;
                scrollRotX = 0; // Disable tilt as requested

                // Swap Front Face Content based on rotation
                const frontFaceImg = document.querySelector('.cube-face.front .cube-logo');
                if (frontFaceImg) {
                    if (scrollRotY > 180) {
                        // We are in the second half, preparing to show the final face
                        frontFaceImg.src = 'assets/cube_final.jpg';
                    } else {
                        // First half, show original logo
                        frontFaceImg.src = 'assets/logo_final.jpg';
                    }
                }

                requestAnimationFrame(updateCubeTransform);
            }

            // WhatsApp Button Visibility
            const floatWhatsapp = document.getElementById('floatWhatsapp');
            if (floatWhatsapp) {
                if (scrollY > heroHeight) {
                    floatWhatsapp.classList.add('visible');
                } else {
                    floatWhatsapp.classList.remove('visible');
                }
            }
        });

        // Mouse Interaction
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;

            mouseRotY = percentX * 20; // Reduced from 30 for smoother interaction
            mouseRotX = percentY * 5; // Further reduced to 5deg as requested

            requestAnimationFrame(updateCubeTransform);
        });

        // Mobile Gyroscope Interaction
        function handleOrientation(event) {
            // Gamma: Left/Right tilt (-90 to 90). Map to Y rotation.
            // Beta: Front/Back tilt (-180 to 180). Map to X rotation.

            let y = event.gamma; // deg
            let x = event.beta;  // deg

            // Center Beta around comfy holding angle (~45deg) if needed, 
            // but for simplicity and stability, we might just clamp absolute values 
            // or relative to initial. 
            // Let's assume standard holding (portrait).
            // beta ~60 is upright. beta 0 is flat.
            // Let's map change from ~45.

            if (y === null || x === null) return;

            // Clamping Y (Side-to-side)
            if (y > 20) y = 20;
            if (y < -20) y = -20;
            mouseRotY = y;

            // Clamping X (Front-to-back)
            // We want very subtle tilt max 5deg.
            // Let's say neutral is 45. 
            // 45 -> 0 tilt.
            // 50 -> -5 tilt (up?).

            let tiltX = (x - 45);
            // Clamp to -5, 5
            if (tiltX > 5) tiltX = 5;
            if (tiltX < -5) tiltX = -5;

            // Invert if necessary to match mouse feel (Up mouse = neg X rot)
            // Phone tilt forward (beta increases > 90? No, flat=0, upright=90)
            // Tilt away (upright) -> see bottom? 
            // Let's stick to the clamped value directly first.
            mouseRotX = -tiltX;

            requestAnimationFrame(updateCubeTransform);
        }

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        // Initialize background state
        updateCubeTransform();
    }
});
