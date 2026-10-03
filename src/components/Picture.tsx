import { images, type ImageKey } from '../config/site'

interface Props {
  name: ImageKey
  alt: string
  sizes: string
  className?: string
  priority?: boolean
  style?: React.CSSProperties
}

/** Responsive local WebP with reserved dimensions. Below-the-fold images lazy-load. */
export function Picture({ name, alt, sizes, className, priority, style }: Props) {
  const img = images[name]
  const srcSet = img.sources.map((s) => `${s.src} ${s.width}w`).join(', ')
  return (
    <img
      src={img.sources[img.sources.length - 1].src}
      srcSet={srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={style}
    />
  )
}
