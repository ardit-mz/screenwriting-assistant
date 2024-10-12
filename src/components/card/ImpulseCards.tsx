import React from "react";
import ImpulseSkeleton from "../skeleton/ImpulseSkeleton.tsx";
import {v4 as uuidv4} from "uuid";
import {Button, Skeleton} from "@mui/material";
import ImpulseCard from "./ImpulseCard.tsx";
import Box from "@mui/material/Box";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";

interface ImpulseCardsProps {
    impulses: string[];
    impulseStage: MenuCardStage;
    handleAdd: (impulse: string) => void;
    handleRewrite: (impulseIndex: number, impulse: string) => void;
    handleDelete: (impulseIndex: number) => void;
    handleMore: () => void;
    loadImpulse: { [p: number]: boolean };
    width: string | number;
    loading: boolean;
}

const ImpulseCards: React.FC<ImpulseCardsProps> = ({ impulses, impulseStage, handleAdd, handleRewrite, handleDelete, handleMore, loadImpulse, width, loading}) => {

    return (<>{
        (loading || impulseStage === MenuCardStage.LOADING)
            ? <> {Array(3).fill(null).map(() => (
                <ImpulseSkeleton key={uuidv4()} style={{marginLeft: 32}} width={width}/>))}
                <Skeleton variant="rounded" width={width} height={36}
                          style={{marginTop: 16, marginLeft: 32,}}
                />

            </>

            : (impulseStage === MenuCardStage.SHOWN)
            && <>
                {impulses.map((impulse, indexImpulseCard) =>
                    <ImpulseCard key={`${impulse}-${indexImpulseCard}`}
                                 impulse={impulse}
                                 index={indexImpulseCard}
                                 handleAdd={() => handleAdd(impulse)}
                                 handleRewrite={() => handleRewrite(indexImpulseCard, impulse)}
                                 handleDelete={() => handleDelete(indexImpulseCard)}
                                 loading={loadImpulse[indexImpulseCard] ?? false}
                                 style={{marginLeft: 32}}
                    />)}
                <Box sx={{width: '100%', mt: 2, ml: 4, pr: 8}}>
                    <Button onClick={handleMore} sx={{width: '100%'}}
                            variant="outlined">More</Button>
                </Box>
            </>
        }</>
    )
}

export default ImpulseCards;