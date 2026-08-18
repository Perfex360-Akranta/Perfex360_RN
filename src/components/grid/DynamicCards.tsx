import Cards from "./Cards";
import { GridProvider } from "../../context/GridProvider";
import { DynamicGridProps } from "../../types/GridFilters";

const DynamicCards: React.FC<DynamicGridProps> = (props) => {

    return (
        <GridProvider>
            <Cards {...props} />
        </GridProvider>
    );
};

export default DynamicCards;