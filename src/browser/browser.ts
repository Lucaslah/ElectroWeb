window.onresize = doLayout;
var isLoading = false;

onload = () => {
  const webview: HTMLInputElement = document.querySelector('webview');
  doLayout();

  document.querySelector<HTMLInputElement>('#back').onclick = () => {
    webview.goBack();
  };

  document.querySelector<HTMLInputElement>('#forward').onclick = () => {
    webview.goForward();
  };

  document.querySelector<HTMLInputElement>('#home').onclick = () => {
    navigateTo('http://google.com/');
  };

  document.querySelector<HTMLInputElement>('#reload').onclick = function() {
    if (isLoading) {
      webview.stop();
    } else {
      webview.reload();
    }
  };
  document.querySelector<HTMLInputElement>('#reload').addEventListener(
    'webkitAnimationIteration',
    function() {
      if (!isLoading) {
        document.body.classList.remove('loading');
      }
    });

  document.querySelector<HTMLInputElement>('#location-form').onsubmit = function(e) {
    e.preventDefault();
    navigateTo(document.querySelector('#location').value);
  };

  webview.addEventListener('close', handleExit);
  webview.addEventListener('did-start-loading', handleLoadStart);
  webview.addEventListener('did-stop-loading', handleLoadStop);
  webview.addEventListener('did-fail-load', handleLoadAbort);
  webview.addEventListener('did-get-redirect-request', handleLoadRedirect);
  webview.addEventListener('did-finish-load', handleLoadCommit);

  // Test for the presence of the experimental <webview> zoom and find APIs.
  if (typeof(webview.setZoom) == "function" &&
      typeof(webview.find) == "function") {
    var findMatchCase = false;

    document.querySelector<HTMLInputElement>('#zoom').onclick = () => {
      if(document.querySelector<HTMLInputElement>('#zoom-box').style.display == '-webkit-flex') {
        closeZoomBox();
      } else {
        openZoomBox();
      }
    };

    document.querySelector<HTMLInputElement>('#zoom-form').onsubmit = (e: Event) => {
      e.preventDefault();
      var zoomText = document.forms['zoom-form']['zoom-text'];
      var zoomFactor = Number(zoomText.value);
      if (zoomFactor > 5) {
        zoomText.value = "5";
        zoomFactor = 5;
      } else if (zoomFactor < 0.25) {
        zoomText.value = "0.25";
        zoomFactor = 0.25;
      }
      webview.setZoom(zoomFactor);
    }

    document.querySelector<HTMLInputElement>('#zoom-in').onclick = function(e) {
      e.preventDefault();
      increaseZoom();
    }

    document.querySelector<HTMLInputElement>('#zoom-out').onclick = function(e) {
      e.preventDefault();
      decreaseZoom();
    }

    document.querySelector<HTMLInputElement>('#find').onclick = () => {
      if (document.querySelector<HTMLInputElement>('#find-box').style.display == 'block') {
        document.querySelector<HTMLInputElement>('webview').stopFinding();
        closeFindBox();
      } else {
        openFindBox();
      }
    };

    document.querySelector<HTMLInputElement>('#find-text').oninput = function(e) {
      webview.find(document.forms['find-form']['find-text'].value,
                   {matchCase: findMatchCase});
    }

    document.querySelector<HTMLInputElement>('#find-text').onkeydown = function(e) {
      if (event.ctrlKey && event.keyCode == 13) {
        e.preventDefault();
        webview.stopFinding('activate');
        closeFindBox();
      }
    }

    document.querySelector<HTMLInputElement>('#match-case').onclick = (e: Event) => {
      e.preventDefault();
      findMatchCase = !findMatchCase;
      var matchCase = document.querySelector<HTMLInputElement>('#match-case');
      if (findMatchCase) {
        matchCase.style.color = "blue";
        matchCase.style['font-weight'] = "bold";
      } else {
        matchCase.style.color = "black";
        matchCase.style['font-weight'] = "";
      }
      webview.find(document.forms['find-form']['find-text'].value,
                   {matchCase: findMatchCase});
    }

    document.querySelector<HTMLInputElement>('#find-backward').onclick = (e: Event) => {
      e.preventDefault();
      webview.find(document.forms['find-form']['find-text'].value,
                   {backward: true, matchCase: findMatchCase});
    }

    document.querySelector<HTMLInputElement>('#find-form').onsubmit = (e: Event) => {
      e.preventDefault();
      webview.find(document.forms['find-form']['find-text'].value,
                   {matchCase: findMatchCase});
    }

    webview.addEventListener('findupdate', handleFindUpdate);
    window.addEventListener('keydown', handleKeyDown);
  } else {
    var zoom = document.querySelector('#zoom');
    var find = document.querySelector('#find');
    zoom.style.visibility = "hidden";
    zoom.style.position = "absolute";
    find.style.visibility = "hidden";
    find.style.position = "absolute";
  }
};

function navigateTo(url: string) {
  resetExitedState();
  document.querySelector<HTMLInputElement>('webview').src = url;
}

const doLayout =() => {
  var webview = document.querySelector<HTMLInputElement>('webview');
  var controls = document.querySelector<HTMLInputElement>('#controls');
  var controlsHeight = controls.offsetHeight;
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var webviewWidth = windowWidth;
  var webviewHeight = windowHeight - controlsHeight;

  webview.style.width = webviewWidth + 'px';
  webview.style.height = webviewHeight + 'px';

  var sadWebview = document.querySelector<HTMLInputElement>('#sad-webview');
  sadWebview.style.width = webviewWidth + 'px';
  sadWebview.style.height = webviewHeight * 2/3 + 'px';
  sadWebview.style.paddingTop = webviewHeight/3 + 'px';
}

const handleExit = (event: { type: string; }) => {
  console.log(event.type);
  document.body.classList.add('exited');
  if (event.type == 'abnormal') {
    document.body.classList.add('crashed');
  } else if (event.type == 'killed') {
    document.body.classList.add('killed');
  }
}

const resetExitedState = () => {
  document.body.classList.remove('exited');
  document.body.classList.remove('crashed');
  document.body.classList.remove('killed');
}

const handleFindUpdate = (event: any) => { // Need to Find Type
  var findResults = document.querySelector<HTMLInputElement>('#find-results');
  if (event.searchText == "") {
    findResults.innerText = "";
  } else {
    findResults.innerText = event.activeMatchOrdinal + " of " + event.numberOfMatches;
  }

  if (event.finalUpdate && !event.canceled) {
    var findBox = document.querySelector<HTMLInputElement>('#find-box');
    findBox.style.left = "";
    findBox.style.opacity = "";
    var findBoxRect = findBox.getBoundingClientRect();
    if (findBoxObscuresActiveMatch(findBoxRect, event.selectionRect)) {
      var potentialLeft = event.selectionRect.left - findBoxRect.width - 10;
      if (potentialLeft >= 5) {
        findBox.style.left = potentialLeft + "px";
      } else {
        findBox.style.opacity = "0.5";
      }
    }
  }
}

const findBoxObscuresActiveMatch = (findBoxRect, matchRect) => {
  return findBoxRect.left < matchRect.left + matchRect.width &&
      findBoxRect.right > matchRect.left &&
      findBoxRect.top < matchRect.top + matchRect.height &&
      findBoxRect.bottom > matchRect.top;
}

const handleKeyDown = (event) => {
  if (event.ctrlKey) {
    switch (event.keyCode) {
      // Ctrl+F.
      case 70:
        event.preventDefault();
        openFindBox();
        break;

      // Ctrl++.
      case 107:
      case 187:
        event.preventDefault();
        increaseZoom();
        break;

      // Ctrl+-.
      case 109:
      case 189:
        event.preventDefault();
        decreaseZoom();
    }
  }
}

const handleLoadCommit = () => {
  resetExitedState();
  var webview = document.querySelector<HTMLInputElement>('webview');
  document.querySelector<HTMLInputElement>('#location').value = webview.getURL();
  document.querySelector<HTMLInputElement>('#back').disabled = !webview.canGoBack();
  document.querySelector<HTMLInputElement>('#forward').disabled = !webview.canGoForward();
  closeBoxes();
}

const handleLoadStart = (event) => {
  document.body.classList.add('loading');
  isLoading = true;

  resetExitedState();
  if (!event.isTopLevel) {
    return;
  }

  document.querySelector<HTMLInputElement>('#location').value = event.url;
}

const handleLoadStop = (_event) => {
  isLoading = false;
}

const handleLoadAbort = (event) => {
  console.log('LoadAbort');
  console.log('  url: ' + event.url);
  console.log('  isTopLevel: ' + event.isTopLevel);
  console.log('  type: ' + event.type);
}

const handleLoadRedirect = (event) => {
  resetExitedState();
  document.querySelector<HTMLInputElement>('#location').value = event.newUrl;
}

const getNextPresetZoom = (zoomFactor) => {
  var preset = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
                2.5, 3, 4, 5];
  var low = 0;
  var high = preset.length - 1;
  var mid;
  while (high - low > 1) {
    mid = Math.floor((high + low)/2);
    if (preset[mid] < zoomFactor) {
      low = mid;
    } else if (preset[mid] > zoomFactor) {
      high = mid;
    } else {
      return {low: preset[mid - 1], high: preset[mid + 1]};
    }
  }
  return {low: preset[low], high: preset[high]};
}

const increaseZoom = () => {
  var webview = document.querySelector<HTMLInputElement>('webview');
  webview.getZoom((zoomFactor) => {
    var nextHigherZoom = getNextPresetZoom(zoomFactor).high;
    webview.setZoom(nextHigherZoom);
    document.forms['zoom-form']['zoom-text'].value = nextHigherZoom.toString();
  });
}

const decreaseZoom = () => {
  var webview = document.querySelector('webview');
  webview.getZoom(function(zoomFactor) {
    var nextLowerZoom = getNextPresetZoom(zoomFactor).low;
    webview.setZoom(nextLowerZoom);
    document.forms['zoom-form']['zoom-text'].value = nextLowerZoom.toString();
  });
}

const openZoomBox = () => {
  document.querySelector<HTMLInputElement>('webview').getZoom((zoomFactor) => {
    const zoomText = document.forms['zoom-form']['zoom-text'];
    zoomText.value = Number(zoomFactor.toFixed(6)).toString();
    document.querySelector('#zoom-box').style.display = '-webkit-flex';
    zoomText.select();
  });
}

const closeZoomBox = () => {
  document.querySelector<HTMLInputElement>('#zoom-box').style.display = 'none';
}

const openFindBox = () => {
  document.querySelector<HTMLInputElement>('#find-box').style.display = 'block';
  document.forms['find-form']['find-text'].select();
}

const closeFindBox = () => {
  const findBox = document.querySelector<HTMLInputElement>('#find-box');
  findBox.style.display = 'none';
  findBox.style.left = "";
  findBox.style.opacity = "";
  document.querySelector<HTMLInputElement>('#find-results').innerText= "";
}

const closeBoxes = () => {
  closeZoomBox();
  closeFindBox();
}

