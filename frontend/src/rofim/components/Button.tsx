import { ComponentProps } from 'react';

const Button = ({ children, ...props }: ComponentProps<'button'>) => (
  <button
    type="button"
    className="rounded-[3px] bg-primary px-4 text-sm leading-[14px] text-white "
    {...props}
  >
    <div className="flex h-10 items-center">{children}</div>
  </button>
);

export default Button;
