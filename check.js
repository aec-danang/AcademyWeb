fetch('https://docs.google.com/forms/d/e/1FAIpQLSfRkzdH22j73HkLltQoPOv064a2IvGcRAiz4WgD59B-xwOqjQ/viewform')
  .then(res => res.text())
  .then(t => { 
    const match = t.match(/https:\/\/drive\.google\.com[^\s"'\\]+/g); 
    console.log(match); 
  });
