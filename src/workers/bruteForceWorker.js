// Full character set for brute force
const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

function generateNextPassword(current, charset) {
  if (!current) return charset[0];

  let carry = true;
  let result = '';
  
  for (let i = current.length - 1; i >= 0; i--) {
    const currentChar = current[i];
    const currentIndex = charset.indexOf(currentChar);
    
    if (carry) {
      if (currentIndex === charset.length - 1) {
        result = charset[0] + result;
        carry = true;
      } else {
        result = charset[currentIndex + 1] + result;
        carry = false;
      }
    } else {
      result = currentChar + result;
    }
  }
  
  if (carry) {
    result = charset[0].repeat(current.length + 1);
  }
  
  if (result.length > 8) return null;
  return result;
}

self.onmessage = function(e) {
  const { targetPassword } = e.data;
  const startTime = performance.now();
  let attempts = 0;
  let current = '';

  // Start with length 1 and increment
  while (true) {
    attempts++;
    
    if (current === targetPassword) {
      self.postMessage({
        type: 'success',
        data: {
          password: current,
          attempts,
          timeTaken: performance.now() - startTime
        }
      });
      return;
    }

    if (attempts % 1000 === 0) {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;
      const speed = Math.floor((attempts * 1000) / elapsedTime);
      
      self.postMessage({
        type: 'progress',
        data: {
          currentAttempt: current,
          attempts,
          speed,
          progress: attempts % 1000000 / 1000000
        }
      });
    }

    current = generateNextPassword(current, charset);
    if (!current) break; // Exceeded max length
  }
  
  // If we get here, password wasn't found
  self.postMessage({
    type: 'failed',
    data: {
      attempts,
      timeTaken: performance.now() - startTime
    }
  });
};
