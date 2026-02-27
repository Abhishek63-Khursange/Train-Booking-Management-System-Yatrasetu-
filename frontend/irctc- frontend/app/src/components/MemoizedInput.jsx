import React from 'react';

const MemoizedInput = React.memo(({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  className = '', 
  disabled = false,
  required = false,
  maxLength,
  ...props 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      {...props}
    />
  );
});

MemoizedInput.displayName = 'MemoizedInput';

export default MemoizedInput;
