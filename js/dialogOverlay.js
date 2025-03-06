
class Dialog {
    constructor(options = {}) {
        const defaultOptions = {
            topImageUrlTextLeft: './resource/dialog_it.png',
            middleImageUrlTextLeft: './resource/dialog_ic.png',
            bottomImageUrlTextLeft: './resource/dialog_is.png',
            topImageUrlTextRight: './resource/dialog_t.png',
            middleImageUrlTextRight: './resource/dialog_c.png',
            bottomImageUrlTextRight: './resource/dialog_s.png',
            width: 600,
            containerSelector: '.ui-container',
        };
        this.settings = { ...defaultOptions, ...options };
        this.elementsState = [];
        this.savedScripts = new Map();
        this.currentScript = '';


        this.container = document.querySelector(this.settings.containerSelector);
        if (!this.container) {
            console.error(`컨테이너 요소 '${this.settings.containerSelector}'를 찾을 수 없습니다.`);
            return null;
        }
    }

    setCurrentScript(scriptName) {
        this.currentScript = scriptName;
    }

    initScript(npcID = -1, npcName = '') {
        if (!this.savedScripts.has(this.currentScript)) {
            this.savedScripts.set(this.currentScript, new Map());
            this.savedScripts.get(this.currentScript).set('visitedPage', new Map());
            this.savedScripts.get(this.currentScript).set('currentPage', 1);
            this.savedScripts.get(this.currentScript).set('npcAnimation', null);
            this.savedScripts.get(this.currentScript).set('npcID', npcID);
            this.savedScripts.get(this.currentScript).set('npcName', npcName);
            this.savedScripts.get(this.currentScript).set('endChat', false);
        }
    }

    createImageAnimation(elementSelector, imageUrls, interval = 180, options = {}) {
        const settings = {
            autoStart: true,
            loop: true,
            ...options
        };

        const element = document.querySelector(elementSelector);
        if (!element) {
            console.error(`요소 '${elementSelector}'를 찾을 수 없습니다.`);
            return null;
        }

        // 초기 설정
        let currentIndex = 0;
        let animationInterval = null;
        let isPlaying = false;

        // 이미지 전환 함수
        function showNextImage() {
            if (currentIndex >= imageUrls.length) {
                if (settings.loop) {
                    currentIndex = 0;
                } else {
                    stop();
                    return;
                }
            }
            
            // 이미지 요소인 경우
            if (element.tagName === 'IMG') {
                element.src = imageUrls[currentIndex];
            } 
            // 배경 이미지로 설정하는 경우
            else {
                element.style.backgroundImage = `url('${imageUrls[currentIndex]}')`;
            }
            
            currentIndex++;
        }

        // 애니메이션 시작 함수
        function start() {
            if (isPlaying) return;
            
            isPlaying = true;
            showNextImage(); // 즉시 첫 이미지 표시
            animationInterval = setInterval(showNextImage, interval);
        }
    
        // 애니메이션 정지 함수
        function stop() {
            if (!isPlaying) return;
            
            isPlaying = false;
            clearInterval(animationInterval);
        }
    
        // 특정 인덱스의 이미지로 이동
        function goToImage(index) {
            currentIndex = index;
            showNextImage();
        }
    
        // 자동 시작 (설정에 따라)
        if (settings.autoStart) {
            start();
        }
    
        // 제어 객체 반환
        return {
            start,
            stop,
            goToImage,
            isPlaying: () => isPlaying,
            getCurrentIndex: () => currentIndex
        };
    }


    createDialogOverlay(message, pageNum, npcID, npcName, showEndChat, showNext, showPrev, showYN, showOK, showAcceptDecline, textLeft=true, playNPCAnimation=true) {
        const thisScript = this.savedScripts.get(this.currentScript);
        if (thisScript == null) {
            console.error(`The script ${this.currentScript} not initialized.`);
        }
        if (!thisScript.get('visitedPage').has(pageNum)) {
            // 메시지 상자 요소 생성
            const messageBox = document.createElement('div');
            messageBox.className = 'message-box';
            messageBox.style.position = 'absolute';
            messageBox.style.top = '50%';
            messageBox.style.left = '50%';
            messageBox.style.transform = 'translate(-50%, -50%)';
            messageBox.style.width = `${this.settings.width}px`;
            messageBox.style.maxWidth = '80%';
            messageBox.style.zIndex = '1000';

            // 상단 이미지 요소 생성
            const topPart = document.createElement('div');
            topPart.className = 'message-top';
            topPart.style.backgroundImage = `url('${textLeft ? this.settings.topImageUrlTextLeft : this.settings.topImageUrlTextRight}')`;
            topPart.style.backgroundRepeat = 'no-repeat';
            topPart.style.backgroundSize = '100% 100%';
            topPart.style.height = '28px';

            // 중간 부분 요소 생성
            const middlePart = document.createElement('div');
            middlePart.className = 'message-middle';
            middlePart.style.backgroundImage = `url('${textLeft ? this.settings.middleImageUrlTextLeft : this.settings.middleImageUrlTextRight}')`;
            middlePart.style.backgroundRepeat = 'repeat-y';
            middlePart.style.backgroundSize = '100% auto';
            middlePart.style.padding = textLeft ? '10px 175px 10px 30px' : '10px 30px 10px 175px';
            middlePart.style.minHeight = '100px';
            middlePart.style.display = 'flex';
            middlePart.style.alignItems = 'center'; // 세로 중앙 정렬
            middlePart.style.border = 'none';
            middlePart.style.overflow = 'hidden';

            // 메시지 텍스트 요소 생성
            const messageText = document.createElement('p');
            messageText.className = 'message-content';
            messageText.position = 'static'
            messageText.display = 'block';
            messageText.textContent = message;
            messageText.style.fontFamily = '돋움';
            messageText.style.fontSize = '8.5pt';
            messageText.style.lineHeight = '1.5';
            messageText.style.border = 'none';
            messageText.style.overflow = 'hidden';

            // 하단 이미지 요소 생성
            const bottomPart = document.createElement('div');
            bottomPart.className = 'message-bottom';
            bottomPart.style.backgroundImage = `url('${textLeft ? this.settings.bottomImageUrlTextLeft : this.settings.bottomImageUrlTextRight}')`;
            bottomPart.style.backgroundRepeat = 'no-repeat';
            bottomPart.style.backgroundSize = '100% 100%';
            bottomPart.style.height = '44px';

            // 요소들 조립
            middlePart.appendChild(messageText);
            messageBox.appendChild(topPart);
            messageBox.appendChild(middlePart);
            messageBox.appendChild(bottomPart);

            const messageBoxButton = document.createElement('div');
            messageBoxButton.className = 'message-btn';
            if (showNext) {
                // NEXT 버튼 요소 생성
                const nextBtnPart = document.createElement('div');
                nextBtnPart.className = 'next';
                nextBtnPart.style.position = 'relative';
                nextBtnPart.style.transform = 'translate(850%, -480%)';
                nextBtnPart.style.backgroundRepeat = 'no-repeat';
                nextBtnPart.style.width = '40px';
                nextBtnPart.style.height = '16px';
                nextBtnPart.style.backgroundImage = `url('./resource/dialog_next-btn_normal.png')`;
                nextBtnPart.addEventListener('mousedown', function() {
                    isPressed = true;
                    this.classList.add('pressed');
                    this.style.setProperty('--next-btn-pressed-background', "url('./resource/dialog_next-btn_pressed.png')");
                });
                nextBtnPart.addEventListener('mouseup', function() {
                    if (isPressed) {
                        this.classList.remove('pressed');
                        this.style.setProperty('--next-btn-pressed-background', null);
                        isPressed = false;
                    }
                });
                nextBtnPart.addEventListener('mouseleave', function() {
                    if (isPressed) {
                        this.classList.remove('pressed');
                        this.style.setProperty('--next-btn-pressed-background', null);
                        isPressed = false;
                    }
                });
                nextBtnPart.addEventListener('click', function() {
                    moveToNextPage();
                });
                messageBoxButton.appendChild(nextBtnPart);
            }


            if (showEndChat) {
                // END CHAT 버튼 요소 생성
                const endChatPart = document.createElement('div');
                endChatPart.className = 'end-chat';
                endChatPart.style.position = 'relative';
                endChatPart.style.transform = 'translate(10%, -250%)';
                endChatPart.style.backgroundRepeat = 'no-repeat';
                endChatPart.style.width = '91px';
                endChatPart.style.height = '16px';
                endChatPart.style.backgroundImage = `url('./resource/dialog_endchat_normal.png')`;
                endChatPart.addEventListener('mousedown', function() {
                    isPressed = true;
                    this.classList.add('pressed');
                    this.style.setProperty('--end-chat-pressed-background', "url('./resource/dialog_endchat_pressed.png')");
                });
                endChatPart.addEventListener('mouseup', function() {
                    if (isPressed) {
                        this.classList.remove('pressed');
                        this.style.setProperty('--end-chat-pressed-background', null);
                        isPressed = false;
                    }
                });
                endChatPart.addEventListener('mouseleave', function() {
                    if (isPressed) {
                        this.classList.remove('pressed');
                        this.style.setProperty('--end-chat-pressed-background', null);
                        isPressed = false;
                    }
                });
                endChatPart.addEventListener('click', function() {
                    setEndChat(true);
                });
                messageBoxButton.appendChild(endChatPart);
            }
            messageBox.appendChild(messageBoxButton);

            // NPC 이미지 요소 생성
            const npcImgPart = document.createElement('div');
            npcImgPart.className = 'message-npc';
            npcImgPart.style.position = 'absolute';
            npcImgPart.style.top = '40%';
            npcImgPart.style.left = '15%';
            npcImgPart.style.transform = 'translate(330%, -50%)';
            npcImgPart.style.backgroundRepeat = 'no-repeat';
            npcImgPart.style.width = '103px';
            npcImgPart.style.height = '80px';

            // NPC 이름 태그 요소 생성
            const npcNameBarPart = document.createElement('div');
            npcNameBarPart.className = 'message-npc-name-bar';
            npcNameBarPart.style.position = 'relative';
            npcNameBarPart.style.transform = 'translate(0%, 450%)';
            npcNameBarPart.style.backgroundRepeat = 'no-repeat';
            npcNameBarPart.style.width = '109px';
            npcNameBarPart.style.height = '19px';
            npcNameBarPart.style.backgroundImage = "url('./resource/dialog_namebar.png')";

            const npcNamePart = document.createElement('div');
            npcNamePart.className = 'message-npc-name';
            npcNamePart.textContent = npcName;
            npcNamePart.style.fontFamily = '돋움';
            npcNamePart.style.position = 'relative';
            npcNamePart.style.textAlign = 'center'
            npcNamePart.style.transform = 'translate(0%, 20%)';
            npcNamePart.style.fontSize = '11px';
            npcNamePart.style.color = 'white';

            messageBox.appendChild(npcImgPart);
            npcImgPart.appendChild(npcNameBarPart);
            npcNameBarPart.appendChild(npcNamePart);

            thisScript.get('visitedPage').set(pageNum, messageBox);
            const moveToNextPage = () => {
                thisScript.set('currentPage', thisScript.get('currentPage') + 1);
            }

            const moveToPreviousPage = () => {
                thisScript.set('currentPage', thisScript.get('currentPage') - 1);
            }

            const setEndChat = (end) => {
                if (this.savedScripts.has(this.currentScript)) {
                    this.savedScripts.get(this.currentScript).set('endChat', end);
                }
            }
        }
    }

    sendNext(message, pageNum, npcID=this.savedScripts.get(this.currentScript).get('npcID'), npcName=this.savedScripts.get(this.currentScript).get('npcName')) {
        this.createDialogOverlay(message, pageNum, npcID, npcName, true, true, false, false, false, false);
    }

    lockClick() {
        // 오버레이 배경 요소 생성 (컨테이너 전체를 덮음)
        this.overlay = document.createElement('div');
        this.overlay.className = 'message-overlay-background';
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.zIndex = '999';
        this.overlay.style.display = 'flex';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.alignItems = 'center';

        // 컨테이너에 오버레이 추가
        this.container.appendChild(this.overlay);

        // 오버레이를 제외한 컨테이너 내 모든 요소 찾기
        const elements = this.container.querySelectorAll('*');

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            
            // 현재 메시지 오버레이 관련 요소는 건너뜀
            if (this.overlay.contains(element) || element === this.overlay) continue;
            
            // 현재 상태 저장
            const state = {
                element: element,
                pointerEvents: element.style.pointerEvents,
                tabIndex: element.tabIndex,
                opacity: element.style.opacity
            };
            
            // 요소 비활성화
            element.style.pointerEvents = 'none'; // 클릭 불가능하게
            element.tabIndex = -1; // 탭 포커스 비활성화
            
            this.elementsState.push(state);
        }
    }

    close() {
        // 저장된 상태 복원
        this.elementsState.forEach(state => {
            state.element.style.pointerEvents = state.pointerEvents;
            state.element.tabIndex = state.tabIndex;
            state.element.style.opacity = state.opacity;
        });

        // 상태 배열 초기화
        this.elementsState.length = 0;
        
        // 오버레이 제거
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }

    readScript(scriptName) {
        const thisScriptPages = this.savedScripts.get(scriptName).get('visitedPage');
        function waitForButtonClick(selector) {
            return new Promise((resolve) => {
                const buttons = document.querySelectorAll(selector);
                
                buttons.forEach(button => {
                    button.addEventListener('click', () => {
                        resolve(button.textContent); // 클릭된 버튼의 텍스트를 반환
                    });
                });
            });
        }
        this.lockClick();
        let currentPage = 1
        async function handleButtonClick() {
            while (true) {
                const messageBox = thisScriptPages.get(currentPage);
                this.container.appendChild(messageBox);
                const npcAnimation = this.createImageAnimation('.message-npc', ['./resource/npc_say_0.png', './resource/npc_say_1.png', './resource/npc_say_2.png', './resource/npc_say_3.png']);
                const clickedButton = await waitForButtonClick('.message-btn');

                if (messageBox && messageBox.parentNode) {
                    messageBox.parentNode.removeChild(messageBox);
                }

                npcAnimation.stop();

                if (this.savedScripts.get(scriptName).get('endChat')) {
                    this.close();
                    break;
                }

                currentPage = this.savedScripts.get(scriptName).get('currentPage');
                
                if (currentPage > this.savedScripts.get(scriptName).get('visitedPage').size) {
                    this.close();
                    break;
                }
            }
        }
        handleButtonClick.bind(this)(); // this 바인딩 후 호출;
    }

}

export { Dialog };