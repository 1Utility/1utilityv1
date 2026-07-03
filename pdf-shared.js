// pdf-shared.js — common engine for every PDF tool page.
// Requires pdf-lib and pdf.js to already be loaded as <script> tags before this file.
// All processing happens in-browser; no file is ever uploaded anywhere.

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

function pdfToast(msg, isError){
  let t = document.getElementById('pdf-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'pdf-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#102A44;color:#fff;padding:12px 22px;border-radius:10px;font-size:13.5px;font-weight:600;z-index:99999;box-shadow:0 8px 30px rgba(0,0,0,.25);transition:opacity .25s;max-width:90vw;text-align:center;';
    document.body.appendChild(t);
  }
  t.style.background = isError ? '#D14343' : '#102A44';
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(()=>{ t.style.opacity='0'; }, 3200);
}

function pdfSetProgress(barId, labelId, pct, label){
  const bar = document.getElementById(barId);
  const lbl = document.getElementById(labelId);
  if(bar){
    bar.style.display = pct >= 100 ? 'none' : 'block';
    const fill = bar.querySelector('.pdf-progress-fill');
    if(fill) fill.style.width = Math.max(0,Math.min(100,pct)) + '%';
  }
  if(lbl) lbl.textContent = pct >= 100 ? '' : (label || '');
}

// Wires a drop-zone element + hidden file input together with shared drag/drop styling and behavior.
function pdfSetupDropzone(zoneId, inputId, onFiles, opts){
  opts = opts || {};
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if(!zone || !input) return;
  zone.addEventListener('click', ()=> input.click());
  input.addEventListener('change', e => { if(e.target.files.length) onFiles([...e.target.files]); });
  ['dragenter','dragover'].forEach(evt => zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.add('pdf-drop-active'); }));
  ['dragleave','drop'].forEach(evt => zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.remove('pdf-drop-active'); }));
  zone.addEventListener('drop', e => {
    const files = [...(e.dataTransfer.files || [])].filter(f => opts.accept ? opts.accept(f) : true);
    if(files.length) onFiles(files);
  });
}

// Loads a File/Blob into a pdf.js document for rendering/inspection.
async function pdfLoadForRender(file){
  const buf = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data: buf }).promise;
}

// Loads a File/Blob into a pdf-lib document for editing/output.
async function pdfLoadForEdit(file){
  const buf = await file.arrayBuffer();
  return PDFLib.PDFDocument.load(buf);
}

// Renders one page of a pdf.js document to a data URL thumbnail.
async function pdfRenderThumb(pdfjsDoc, pageNum, maxWidth){
  maxWidth = maxWidth || 160;
  const page = await pdfjsDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
  return canvas.toDataURL('image/png');
}

function pdfDownloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=> URL.revokeObjectURL(url), 4000);
}

async function pdfBytesToBlob(bytes){
  return new Blob([bytes], { type: 'application/pdf' });
}

function pdfFormatSize(bytes){
  if(bytes < 1024) return bytes + ' B';
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(2) + ' MB';
}

function pdfMakeSortable(containerEl, onReorder){
  let dragEl = null;
  containerEl.querySelectorAll('[data-pdf-sortable]').forEach(item => {
    item.draggable = true;
    item.addEventListener('dragstart', () => { dragEl = item; item.style.opacity = '0.4'; });
    item.addEventListener('dragend', () => { item.style.opacity = '1'; onReorder(); });
    item.addEventListener('dragover', e => e.preventDefault());
    item.addEventListener('drop', e => {
      e.preventDefault();
      if(dragEl && dragEl !== item){
        const items = [...containerEl.children];
        const dragIdx = items.indexOf(dragEl), dropIdx = items.indexOf(item);
        if(dragIdx < dropIdx) item.after(dragEl); else item.before(dragEl);
      }
    });
  });
}
