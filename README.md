# dog-cat-class

2026-02-24
Keras Xception 모델(`best_model.xception.keras`)을 기반으로 고양이와 강아지 이미지를 분류하는 웹서비스입니다.

## 🚀 실행 방법

### 1. 가상환경 설정 및 활성화 (선택)
```bash
conda create -n dogCat python=3.11
conda activate dogCat
```

### 2. 패키지 설치
이 프로젝트는 `Flask`, `TensorFlow`, `Pillow`, `Numpy` 등을 필요로 합니다. 
아래 명령어로 한 번에 설치하세요.

```bash
pip install -r requirements.txt
```

### 3. 서버 구동
```bash
python app.py
```
명령어를 실행한 뒤, 브라우저에서 `http://127.0.0.1:5000` 으로 접속할 수 있습니다. 이미지를 드래그 앤 드롭해서 결과를 확인할 수 있습니다.
