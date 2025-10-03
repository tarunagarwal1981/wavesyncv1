'use client';

import { useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Fallback for react-window if not available
let List: any = null;
try {
  const { FixedSizeList } = require('react-window');
  List = FixedSizeList;
} catch (e) {
  // Fallback component if react-window is not available
  List = ({ children, ...props }: any) => (
    <div {...props}>
      {children}
    </div>
  );
}

interface VirtualListProps<T> {
 items: T[];
  itemHeight: number;
  height?: number | string;
  width?: number | string;
  renderItem: (props: {
    index: number;
    style: React.CSSProperties;
    item: T;
  }) => ReactNode;
  className?: string;
  containerClassName?: string;
  onScroll?: (scrollOffset: number) => void;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height = '400px',
  width = '100%',
  renderItem,
  className,
  containerClassName,
  onScroll,
}: VirtualListProps<T>) {
  const [listHeight, setListHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setListHeight(containerRef.current.clientHeight - 20); // Account for padding
    }
  }, [height]);

  const itemRenderer = useMemo(() => {
    return ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = items[index];
      return renderItem({ index, style, item });
    };
  }, [items, renderItem]);

  const handleScroll = ({ scrollOffset }: { scrollOffset: number }) => {
    onScroll?.(scrollOffset);
  };

  if (items.length === 0) {
    return (
      <div className={cn("flex items-center justify-center", containerClassName)}>
        <div className="text-center text-muted-foreground p-8">
          <p>No items to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", containerClassName)}>
      <div ref={containerRef} className="h-full">
        <List
          height={listHeight}
          itemCount={items.length}
          itemSize={itemHeight}
          onScroll={handleScroll}
          className={className}
        >
          {itemRenderer}
        </List>
      </div>
    </div>
  );
}

// Mobile-optimized infinite scroll list
interface InfiniteVirtualListProps<T> extends VirtualListProps<T> {
  hasMore: boolean;
  loadMore: () => Promise<void>;
  isLoading: boolean;
  loadingComponent?: ReactNode;
}

export function InfiniteVirtualList<T>({
  items,
  itemHeight,
  height = '100%',
  width = '100%',
  renderItem,
  hasMore,
  loadMore,
  isLoading,
  loadingComponent,
  className,
  containerClassName,
}: InfiniteVirtualListProps<T>) {
  const [allItems, setAllItems] = useState(items);
  const loadingRef = useRef(false);

  useEffect(() => {
    setAllItems(items);
  }, [items]);

  const loadMoreItems = async () => {
    if (loadingRef.current || !hasMore || isLoading) return;
    
    loadingRef.current = true;
    await loadMore();
    loadingRef.current = false;
  };

  const enhancedRenderItem = ({
    index,
    style,
    item,
  }: {
    index: number;
    style: React.CSSProperties;
    item: T;
  }) => {
    return (
      <div>
        {renderItem({ index, style, item })}
        
        {/* Load more trigger */}
        {index === allItems.length - 1 && hasMore && (
          <div className="p-4">
            {loadingComponent || (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <VirtualList
      items={allItems}
      itemHeight={itemHeight}
      height={height}
      width={width}
      renderItem={enhancedRenderItem}
      className={className}
      containerClassName={containerClassName}
    />
  );
}

// Simple infinite scroll hook
export function useInfiniteScroll<T>(
  items: T[],
  loadMore: () => Promise<void>,
  hasMore: boolean,
  isLoading: boolean
) {
  const [visibleItems, setVisibleItems] = useState<T[]>(items.slice(0, 20));
  const [currentIndex, setCurrentIndex] = useState(20);

  useEffect(() => {
    setVisibleItems(items.slice(0, currentIndex));
  }, [items, currentIndex]);

  const loadMoreItems = async () => {
    if (!hasMore || isLoading) return;
    
    await loadMore();
    setCurrentIndex(prev => Math.min(prev + 20, items.length));
  };

  return {
    visibleItems,
    loadMoreItems,
    hasMore: hasMore && currentIndex < items.length,
  };
}



