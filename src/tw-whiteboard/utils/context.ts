import { createContext } from 'react';
import type { IAppProps } from '../components/App';

export const PropsContext = createContext<IAppProps | undefined>(undefined);
