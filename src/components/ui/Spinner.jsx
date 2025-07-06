function Spinner({ size = 'medium' }) {
  // Size classes
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-primary-600 border-r-transparent border-b-primary-600 border-l-transparent`} 
      />
    </div>
  );
}

export default Spinner; 