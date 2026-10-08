interface MenuItem {
    menuNumber: string;
    parentNumber?: string;
    menuName: string;
    menuCaption: string;
    menuLevel?: string;
    menuSortNumber?: string;
    parent: boolean;
    master: boolean;
    formName?: string;
    relatedFilter?: string;
    filterNeed?: string;

    children?: MenuItem[];
    expanded?: boolean;
    loading?: boolean;
}