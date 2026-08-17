// context/GridContext.tsx

import React, { createContext, useContext, useState } from 'react';
import { GridFilterProps } from '../types/GridFilters';
import { User ,UserRole} from '../types/UserDetails';


const defaultFilter: GridFilterProps = {
  flid: '',
  companyId: '',
  locationId: '',
  sbuId: '',
  pbuId: '',
  sectionId: '',
  cellId: '',
  machineId: '',
  fromDate: null,
  toDate: null,
  fromMonth: null,
  toMonth: null,
  monthWise: 'N',
  columnFilters: [],
};
const defaultUser: User = {
   userId: '',
  userName: '',
  loginId: '',
  employeeId:''
};

const defaultRole: UserRole = {
  roleId:'',
   roleCode:'',
   roleName:'',
   roleLevel:0,
   flid:'',
   originalId:'',
   fnlnDisplayCode:'',
   fnlnDescription:'',
   parentFlids:'',
   allParents:'',
   parents:'',
   elementType:''
};




interface GridContextType {
  filter: GridFilterProps;
  setFilter: React.Dispatch<React.SetStateAction<GridFilterProps>>;
  currentUser:User;
  setCurrentUser:React.Dispatch<React.SetStateAction<User>>;
  currentRole:UserRole;
  setCurrentRole:React.Dispatch<React.SetStateAction<UserRole>>;
}

const GridContext = createContext<GridContextType | null>(null);

export const GridProvider = ({
  children,
  initialFilter = defaultFilter,
}: {
  children: React.ReactNode;
  initialFilter?: GridFilterProps;
}) => {

  const [filter, setFilter] = useState(initialFilter);
  const [currentUser, setCurrentUser] = useState(defaultUser);
  const [currentRole, setCurrentRole] = useState(defaultRole);

  return (
    <GridContext.Provider value={{ filter, setFilter , currentUser,setCurrentUser,currentRole,setCurrentRole }}>
      {children}
    </GridContext.Provider>
  );
};

export const useGrid = () => {
  const context = useContext(GridContext);

  if (!context) {
    throw new Error('useGrid must be used inside GridProvider');
  }

  return context;
};