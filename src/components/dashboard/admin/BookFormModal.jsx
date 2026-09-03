'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import {
  X, Save, Loader2, Upload, Image as ImageIcon, Trash2, AlertCircle, CheckCircle2, CloudUpload, RefreshCw, Plus, ClipboardPaste } from 'lucide-react';
import api from '@/services/api';
import { addBook, updateBook } from '@/redux/slices/booksSlice';
import toast from 'react-hot-toast';

const ALLOWED_MIME_TYPES = Object.freeze([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = Object.freeze(['png', 'jpg', 'jpeg', 'webp']);
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const CATEGORY_OPTIONS = Object.freeze(['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Other']);
const MAGIC_BYTES = Object.freeze([
  { offset: 0,
    bytes: [0x89, 0x50, 0x4E, 0x47],
    name: 'png',
    mime: 'image/png',
  }, {
    offset: 0,
    bytes: [0xFF, 0xD8, 0xFF],
    name: 'jpeg',
    mime: 'image/jpeg',
  }, {
    offset: 0,
    bytes: [0x52, 0x49, 0x46, 0x46],
    name: 'webp',
    mime: 'image/webp',
    suffix: [0x57, 0x45, 0x42, 0x50],
    suffixOffset: 8,
  }]);

const TITLE_MAX = 200;
const AUTHOR_MAX = 100;
const DESCRIPTION_MAX = 1000;


function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function extensionFromFileName(name) {
  return (name.split('.').pop() || '').toLowerCase();
}

function compareBytes(a, b) {
  if (a.length < b.length) return false;
  for (let i = 0; i < b.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function readMagicBytes(file, length = 16) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read file bytes'));
    reader.onload = () => {
      const buffer = reader.result;
      resolve(new Uint8Array(buffer, 0, length));
    };
    reader.readAsArrayBuffer(file.slice(0, length));
  });
}

function mimeToExtension(mime) {
  switch (mime) {
    case 'image/png': return 'png';
    case 'image/jpeg':
    case 'image/jpg': return 'jpg';
    case 'image/webp': return 'webp';
    default: return 'png';
  }
}

async function validateImageFile(file) {
  if (!file) {
    return { valid: false, reason: 'No file was selected' };
  }

  if (!(file instanceof File)) {
    return { valid: false, reason: 'Invalid file object provided' };
  }

  if (file.size === 0) {
    return { valid: false, reason: 'The selected file is empty (0 bytes)' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      reason: `File exceeds maximum size of ${formatBytes(MAX_FILE_SIZE_BYTES)} (yours is ${formatBytes(file.size)})`,
    };
  }

  const extension = extensionFromFileName(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      reason: `File extension ".${extension || 'unknown'}" is not allowed. Only ${ALLOWED_EXTENSIONS.map(e => e.toUpperCase()).join('/')} files accepted.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      reason: `File MIME type "${file.type}" is not allowed. Only image/png, image/jpeg, and image/webp files are accepted.`,
    };
  }

  let header;
  try {
    header = await readMagicBytes(file, 16);
  } catch (e) {
    return { valid: false, reason: 'Unable to verify file contents. Please select a different image.' };
  }

  let matched;
  for (const pattern of MAGIC_BYTES) {
    if (compareBytes(header.subarray(pattern.offset), pattern.bytes)) {
      if (pattern.suffix && pattern.suffixOffset !== undefined) {
        if (header.length < pattern.suffixOffset + pattern.suffix.length) continue;
        if (!compareBytes(header.subarray(pattern.suffixOffset), pattern.suffix)) continue;
      }
      matched = pattern;
      break;
    }
  }

  if (!matched) {
    return {
      valid: false,
      reason:
        'File content does not match the declared extension. The image may be renamed from another file type. Please select a genuine PNG, JPG, or WEBP file.',
    };
  }

  return {
    valid: true,
    detectedFormat: matched.name,
    mime: matched.mime,
  };
}

function CharCounter({ current, max }) {
  const percent = Math.min(100, (current / max) * 100);
  const nearLimit = current / max >= 0.85;
  const overLimit = current > max;
  return (
    <div className="flex items-center justify-between mt-1.5 gap-3">
      <div className={`text-xs font-medium tabular-nums ${overLimit ? 'text-red-600 dark:text-red-400' : nearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {current} / {max}
      </div>
      <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${overLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

export default function BookFormModal({ isOpen, onClose, book = null }) {
  const dispatch = useDispatch();
  const { actionLoading, error } = useSelector((state) => state.books);
  const isEditing = !!book;

  const initialCategories = useMemo(() => {
    if (book) {
      if (Array.isArray(book.categories) && book.categories.length > 0) return [...book.categories];
      if (book.category) return [book.category];
    }
    return [];
  }, [book]);

  const { register, handleSubmit, reset, watch, setValue, setError, clearErrors, trigger, formState: { errors, isDirty } } = useForm({
    defaultValues: { quantity: 1, publishYear: new Date().getFullYear(), imageUrl: '', categories: [] },
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    shouldFocusError: true,
  });

  const imageUrl = watch('imageUrl');
  const titleValue = watch('title') || '';
  const authorValue = watch('author') || '';
  const descriptionValue = watch('description') || '';

  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewBookImage, setPreviewBookImage] = useState('');
  const [uploadStage, setUploadStage] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const fileInputRef = useRef(null);
  const abortUploadRef = useRef(null);
  const dropzoneRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialCategories.length > 0) {
      setValue('categories', initialCategories, { shouldValidate: false, shouldDirty: false });
      setValue('category', initialCategories[0], { shouldValidate: false, shouldDirty: false });
    }
  }, [isOpen, initialCategories, setValue]);

  useEffect(() => {
    if (book && isOpen) {
      reset({ ...book, imageUrl: book.imageUrl || book.bookImage?.url || '', categories: initialCategories, category: initialCategories[0] || '' });
      setPreviewBookImage(book.imageUrl || book.bookImage?.url || '');
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadError('');
      setUploadProgress(0);
      setUploadStage('idle');
    } else if (!book && isOpen) {
      reset({
        title: '', author: '', category: '', categories: [], isbn: '', publisher: '',
        publishYear: new Date().getFullYear(), quantity: 1, description: '', imageUrl: '',
      });
      setSelectedCategories([]);
      setSelectedFile(null);
      setPreviewUrl('');
      setPreviewBookImage('');
      setUploadError('');
      setUploadProgress(0);
      setUploadStage('idle');
    }
  }, [book, isOpen, reset, initialCategories]);

  useEffect(() => () => {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); }
  }, [previewUrl]);

  useEffect(() => () => {
    if (abortUploadRef.current) abortUploadRef.current.abort();
  }, []);

  useEffect(() => {
    if (uploadStage === 'uploading') setAnnouncement('Uploading image to Cloudinary...');
    else if (uploadStage === 'done') setAnnouncement('Image upload complete.');
    else if (uploadStage === 'error') setAnnouncement(`Upload error: ${uploadError}`);
  }, [uploadStage, uploadError]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (event) => {
      if (uploadStage === 'uploading' || uploadStage === 'validating' || uploadStage === 'requesting-signature') return;
      const items = event.clipboardData?.items;
      if (!items) return;

      let imageFile = null;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const ext = mimeToExtension(blob.type);
            const filename = `pasted-image-${Date.now()}.${ext}`;
            imageFile = new File([blob], filename, { type: blob.type });
            break;
          }
        }
      }

      if (imageFile) {
        setAnnouncement('Pasted image detected, processing...');
        toast('Image pasted from clipboard', { icon: '📋' });
        await handleFileChange(imageFile);
      }
    };

    const target = modalRef.current;
    if (target) {
      target.addEventListener('paste', handlePaste);
    }
    return () => {
      if (target) {
        target.removeEventListener('paste', handlePaste);
      }
    };
  }, [isOpen, uploadStage]);

  const effectiveImage = useMemo(() => (
    selectedFile ? previewUrl : (imageUrl || previewBookImage)
  ), [selectedFile, previewUrl, imageUrl, previewBookImage]);

  const canSubmit = useMemo(() => (
    uploadStage !== 'uploading' && uploadStage !== 'validating' && uploadStage !== 'requesting-signature' && uploadStage !== 'verifying'
  ), [uploadStage]);

  const addCategory = (category) => {
    if (!category) return;
    if (selectedCategories.includes(category)) {
      toast.error(`"${category}" is already added`);
      return;
    }
    const next = [...selectedCategories, category];
    setSelectedCategories(next);
    setValue('categories', next, { shouldValidate: true, shouldDirty: true });
    setValue('category', next[0], { shouldValidate: false, shouldDirty: false });
    if (errors.categories) clearErrors('categories');
    trigger('categories');
  };

  const removeCategory = (categoryToRemove) => {
    const next = selectedCategories.filter((c) => c !== categoryToRemove);
    setSelectedCategories(next);
    setValue('categories', next, { shouldValidate: true, shouldDirty: true });
    setValue('category', next[0] || '', { shouldValidate: false, shouldDirty: false });
    if (next.length === 0) {
      setError('categories', { type: 'manual', message: 'At least one category is required' });
    }
  };

  const onCategoryDropdownChange = (event) => {
    const value = event.target.value;
    event.target.value = '';
    addCategory(value);
  };

  const chooseFile = () => {
    if (!canSubmit) return;
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    if (uploadStage === 'uploading' || uploadStage === 'requesting-signature' || uploadStage === 'verifying') return;
    setSelectedFile(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); }
    setPreviewUrl('');
    setPreviewBookImage('');
    setUploadError('');
    setUploadProgress(0);
    setUploadStage('idle');
    setValue('imageUrl', '', { shouldValidate: false });
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    if (uploadStage === 'uploading' || uploadStage === 'validating') return;

    setUploadError('');
    setUploadProgress(0);
    setUploadStage('validating');

    const result = await validateImageFile(file);

    if (!result.valid) {
      setUploadError(result.reason || 'Invalid file');
      setUploadStage('error');
      toast.error(result.reason || 'Invalid file');
      if (fileInputRef.current) { fileInputRef.current.value = ''; }
      setSelectedFile(null);
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(objectUrl);
      setPreviewBookImage('');
      setSelectedFile(file);
      setUploadStage('idle');

      setValue('imageUrl', objectUrl, { shouldDirty: false, shouldValidate: false });
    } catch {
      setSelectedFile(file);
      setUploadStage('idle');
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileChange(file ?? null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const requestCloudinarySignature = async () => {
    const res = await api.get('/upload/cloudinary-signature');
    const payload = res.data?.data ?? res.data;
    if (!payload || !payload.signature) {
      throw new Error(res.data?.message || 'Failed to retrieve secure upload signature');
    }
    return payload;
  };

  const uploadToCloudinary = async (file, signature) => {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', signature.apiKey);
      form.append('timestamp', String(signature.timestamp));
      form.append('signature', signature.signature);
      if (signature.allowedFormats && Array.isArray(signature.allowedFormats) && signature.allowedFormats.length > 0) {
        form.append('allowed_formats', signature.allowedFormats.join(','));
      }
      if (signature.folder) {
        form.append('folder', signature.folder);
      }
      if (signature.uploadPreset) {
        form.append('upload_preset', signature.uploadPreset);
      }

      const xhr = new XMLHttpRequest();
      abortUploadRef.current = xhr;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          setUploadProgress(percent);
        }
      });

      xhr.addEventListener('error', () => {
        setUploadStage('error');
        reject(new Error('Network error during image upload. Please check your connection and try again.'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.addEventListener('load', () => {
        try {
          if (xhr.status < 200 || xhr.status >= 300) {
            let err = {};
            try { err = JSON.parse(xhr.responseText || '{}'); } catch { /* ignore parse error */ }
            const msg = err?.error?.message || xhr.statusText || `Upload failed (HTTP ${xhr.status})`;
            reject(new Error(msg));
            return;
          }
          const body = JSON.parse(xhr.responseText || '{}');
          if (!body || !body.secure_url) {
            reject(new Error('Upload completed, but no image URL was returned from Cloudinary'));
            return;
          }
          resolve(body.secure_url);
        } catch (e) {
          reject(new Error('Could not parse Cloudinary upload response'));
        }
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`, true);
      xhr.send(form);
    });
  };

  const performUploadIfNeeded = async () => {
    if (!selectedFile) return;

    setUploadStage('requesting-signature');
    setUploadProgress(0);
    let signature;
    try {
      signature = await requestCloudinarySignature();
    } catch (err) {
      setUploadStage('error');
      const msg = err.message || 'Could not obtain Cloudinary signature';
      setUploadError(msg);
      toast.error(msg);
      throw err;
    }

    setUploadStage('uploading');
    try {
      const secureUrl = await uploadToCloudinary(selectedFile, signature);
      setUploadStage('verifying');
      const asUrl = new URL(secureUrl);
      if (!asUrl.protocol.startsWith('http')) {
        throw new Error('Uploaded image did not return a secure URL');
      }
      setUploadProgress(100);
      setValue('imageUrl', secureUrl);
      setPreviewBookImage(secureUrl);
      if (previewUrl) { URL.revokeObjectURL(previewUrl); }
      setPreviewUrl('');
      setSelectedFile(null);
      setUploadStage('done');
    } catch (err) {
      setUploadStage('error');
      setUploadError(err.message || 'Image upload failed');
      toast.error(err.message || 'Image upload failed');
      setUploadProgress(0);
      throw err;
    }
  };

  const onSubmit = async (data) => {
    try {
      setAnnouncement('Saving book details...');

      const finalCategories = Array.isArray(data.categories) && data.categories.length > 0
        ? data.categories
        : (data.category ? [data.category] : []);

      if (finalCategories.length === 0) {
        setError('categories', { type: 'manual', message: 'At least one category is required' });
        toast.error('Please add at least one category');
        return;
      }

      if (selectedFile && uploadStage !== 'done') {
        await performUploadIfNeeded();
      }

      const finalPayload = {
        ...data,
        categories: finalCategories,
        category: finalCategories[0],
      };
      if (!finalPayload.imageUrl && previewBookImage) {
        finalPayload.imageUrl = previewBookImage;
      }

      if (isEditing) {
        await dispatch(updateBook({ id: book._id, data: finalPayload })).unwrap();
        toast.success('Book updated successfully');
        setAnnouncement('Book updated successfully.');
      } else {
        await dispatch(addBook(finalPayload)).unwrap();
        toast.success('Book added successfully');
        setAnnouncement('Book added successfully.');
      }
      onClose();
    } catch (err) {
      toast.error(err?.payload || err?.message || 'Unable to save book at this time');
      setAnnouncement('Error saving book.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-full outline-none"
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {isEditing ? 'Edit Book Details' : 'Add New Book'}
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-start gap-3 border border-red-100 dark:border-red-900/30" role="alert">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Submission Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-start gap-3 border border-red-100 dark:border-red-900/30" role="alert">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Image Upload Error</p>
                <p>{uploadError}</p>
              </div>
            </div>
          )}

          <form id="book-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <fieldset>
                  <legend className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-800 w-full pb-2">
                    Basic Details
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Title <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input 
                        id="title"
                        {...register('title', {
                          required: 'Title is required',
                          maxLength: { value: TITLE_MAX, message: `Title must be ${TITLE_MAX} characters or less` }
                        })} 
                        onInput={() => trigger('title')}
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? "title-error title-counter" : "title-counter"}
                        aria-required="true"
                        className={`w-full h-11 px-3.5 rounded-lg border transition-all ${errors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0`} 
                      />
                      <CharCounter current={titleValue.length} max={TITLE_MAX} />
                      {errors.title && <p id="title-error" className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{errors.title.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="author" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Author <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input 
                        id="author"
                        {...register('author', {
                          required: 'Author is required',
                          maxLength: { value: AUTHOR_MAX, message: `Author must be ${AUTHOR_MAX} characters or less` }
                        })} 
                        onInput={() => trigger('author')}
                        aria-invalid={!!errors.author}
                        aria-describedby={errors.author ? "author-error author-counter" : "author-counter"}
                        aria-required="true"
                        className={`w-full h-11 px-3.5 rounded-lg border transition-all ${errors.author ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0`} 
                      />
                      <CharCounter current={authorValue.length} max={AUTHOR_MAX} />
                      {errors.author && <p id="author-error" className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{errors.author.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="category-dropdown" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Categories <span className="text-red-500" aria-hidden="true">*</span>
                      </label>

                      {selectedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3" role="list" aria-label="Selected categories">
                          {selectedCategories.map((category) => (
                            <span
                              key={category}
                              role="listitem"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 transition-colors"
                            >
                              {category}
                              <button
                                type="button"
                                onClick={() => removeCategory(category)}
                                aria-label={`Remove ${category} category`}
                                className="p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors text-blue-600 dark:text-blue-300 min-h-[24px] min-w-[24px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          id="category-dropdown"
                          onChange={onCategoryDropdownChange}
                          defaultValue=""
                          aria-invalid={!!errors.categories}
                          aria-describedby={errors.categories ? "categories-error" : undefined}
                          className={`flex-1 h-11 px-3.5 rounded-lg border ${errors.categories ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow`}
                        >
                          <option value="" disabled>Select a category to add...</option>
                          {CATEGORY_OPTIONS.map((option) => (
                            <option key={option} value={option} disabled={selectedCategories.includes(option)}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const select = document.getElementById('category-dropdown');
                            if (select && select.value) {
                              addCategory(select.value);
                              select.value = '';
                            } else {
                              toast('Pick a category from the dropdown to add', { icon: '💡' });
                            }
                          }}
                          className="h-11 px-4 rounded-lg bg-blue-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-[44px]"
                        >
                          <Plus className="w-4 h-4" /> Add More Categories
                        </button>
                      </div>
                      {errors.categories && <p id="categories-error" className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{errors.categories.message}</p>}
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-800 w-full pb-2">
                    Publishing Information
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="isbn" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">ISBN</label>
                      <input 
                        id="isbn"
                        {...register('isbn')} 
                        onInput={() => trigger('isbn')}
                        aria-invalid={!!errors.isbn}
                        aria-describedby={errors.isbn ? "isbn-error" : undefined}
                        className={`w-full h-11 px-3.5 rounded-lg border transition-all ${errors.isbn ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow`} 
                      />
                      {errors.isbn && <p id="isbn-error" className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{errors.isbn.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="publisher" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Publisher <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input 
                        id="publisher"
                        {...register('publisher', { required: 'Publisher is required' })} 
                        onInput={() => trigger('publisher')}
                        aria-invalid={!!errors.publisher}
                        aria-describedby={errors.publisher ? "publisher-error" : undefined}
                        aria-required="true"
                        className={`w-full h-11 px-3.5 rounded-lg border transition-all ${errors.publisher ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 transition-shadow`} 
                      />
                      {errors.publisher && <p id="publisher-error" className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{errors.publisher.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="publishYear" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Publication Year <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input 
                        id="publishYear"
                        type="number" 
                        {...register('publishYear', {
                          valueAsNumber: true,
                          required: 'Year is required',
                          min: { value: 1000, message: 'Year must be a 4-digit number' },
                          max: { value: new Date().getFullYear(), message: `Year cannot exceed ${new Date().getFullYear()}` }
                        })} 
                        onInput={() => trigger('publishYear')}
                        aria-invalid={!!errors.publishYear}
                        aria-describedby={errors.publishYear ? "publishYear-error" : undefined}
                        aria-required="true"
                        className={`w-full h-11 px-3.5 rounded-lg border transition-all ${errors.publishYear ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 transition-shadow`} 
                      />
                      {errors.publishYear && <p id="publishYear-error" className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{errors.publishYear.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Total Copies <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input 
                        id="quantity"
                        type="number" 
                        {...register('quantity', {
                          valueAsNumber: true,
                          required: 'Quantity is required',
                          min: { value: 1, message: 'Quantity must be at least 1' }
                        })} 
                        onInput={() => trigger('quantity')}
                        aria-invalid={!!errors.quantity}
                        aria-describedby={errors.quantity ? "quantity-error" : undefined}
                        aria-required="true"
                        className={`w-full h-11 px-3.5 rounded-lg border transition-all ${errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 transition-shadow`} 
                      />
                      {errors.quantity && <p id="quantity-error" className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{errors.quantity.message}</p>}
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="sr-only">Additional Information</legend>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea 
                      id="description"
                      {...register('description', {
                        maxLength: { value: DESCRIPTION_MAX, message: `Description must be ${DESCRIPTION_MAX} characters or less` }
                      })} 
                      rows={4} 
                      onInput={() => trigger('description')}
                      aria-invalid={!!errors.description}
                      aria-describedby={errors.description ? "description-error description-counter" : "description-counter"}
                      className={`w-full p-3.5 rounded-lg border transition-all ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 transition-shadow resize-y`} 
                    />
                    <CharCounter current={descriptionValue.length} max={DESCRIPTION_MAX} />
                    {errors.description && <p id="description-error" className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{errors.description.message}</p>}
                  </div>
                </fieldset>
              </div>

              <div className="lg:col-span-4">
                <fieldset>
                  <legend className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-800 w-full pb-2 flex justify-between items-center">
                    <span>Cover Image</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Max 4MB</span>
                  </legend>
                  
                  <div className="text-xs mb-3 flex items-center justify-between text-slate-500 dark:text-slate-400 px-1">
                    <span className="inline-flex items-center gap-1.5">
                      <ClipboardPaste className="w-3.5 h-3.5" /> Tip: press Ctrl/Cmd+V to paste
                    </span>
                    <span>PNG · JPG · WEBP</span>
                  </div>
                  
                  {effectiveImage ? (
                    <div className="space-y-4">
                      <div 
                        ref={dropzoneRef}
                        className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group"
                      >
                        <Image
                          src={effectiveImage}
                          alt="Book cover preview"
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-contain p-2 bg-slate-50 dark:bg-slate-900"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
                          <button
                            type="button"
                            onClick={chooseFile}
                            disabled={!canSubmit}
                            className="px-4 py-2 text-sm font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none flex items-center gap-2 disabled:opacity-50 min-w-[120px] justify-center transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" /> Replace
                          </button>
                          <button
                            type="button"
                            onClick={clearImage}
                            disabled={!canSubmit}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none flex items-center gap-2 disabled:opacity-50 min-w-[120px] justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>

                      {uploadStage === 'uploading' && (
                        <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                          <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
                              <CloudUpload className="w-4 h-4 animate-bounce" /> Uploading...
                            </span>
                            <span className="font-semibold text-blue-700 dark:text-blue-400">{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-950 overflow-hidden" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {uploadStage === 'done' && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-sm font-medium text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <CheckCircle2 className="w-5 h-5 shrink-0" /> Image successfully uploaded
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      ref={dropzoneRef}
                      role="button"
                      tabIndex={0}
                      onClick={chooseFile}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseFile(); } }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                      onDrop={handleDrop}
                      aria-label="Upload cover image. You can also paste an image from your clipboard using Ctrl or Cmd V."
                      className={`w-full aspect-[3/4] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-4 p-6 cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700'}`}>
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Click to upload <span className="font-normal text-slate-500 dark:text-slate-400">or drag & drop</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WEBP (Max 4MB)</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-700/60 inline-flex items-center gap-1.5">
                          <ClipboardPaste className="w-3.5 h-3.5" /> or press Ctrl/Cmd+V to paste
                        </p>
                      </div>
                      
                      {uploadStage === 'requesting-signature' && (
                        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                          <Loader2 className="w-4 h-4 animate-spin" /> Preparing upload...
                        </div>
                      )}
                      {uploadStage === 'validating' && (
                        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying file...
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                    onChange={handleInputChange}
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <input type="hidden" {...register('imageUrl')} />
                  <input type="hidden" {...register('categories')} />
                  <input type="hidden" {...register('category')} />
                </fieldset>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="book-form"
            disabled={actionLoading || !canSubmit}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-[44px]"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{isEditing ? 'Save Changes' : 'Add Book'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
