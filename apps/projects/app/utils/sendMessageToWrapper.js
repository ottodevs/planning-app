export const sendMessageToWrapper = (name, value) => {
  console.log('utils/sendMessageToWrapper', name, value)

  window.parent.postMessage({ from: 'app', name, value }, '*')
}
