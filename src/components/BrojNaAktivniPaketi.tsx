import { Box, Typography } from "@mui/material";
import { ChartOptions } from "chart.js";
import { Pie } from "react-chartjs-2";
import { BrojNaAktivniPaketiInterface } from "../interfaces/BrojNaAktivniPaketiInterface";
import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Link } from "./LinkBase";

ChartJS.register(ArcElement, Tooltip, Legend);

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: '#32355c',
});

const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
            position: 'right',
        },
        title: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const tooltipValue = context.dataset.data[context.dataIndex];
                    return `${tooltipValue.toFixed(2)} %`;
                }
            },
        }
    },

};

const transformData = (data: BrojNaAktivniPaketiInterface[]) => {
    const activePackages = data.reduce((accumulator, item) => {
        const packageName = item.nazivPaket;

        if (!accumulator[packageName]) {
            accumulator[packageName] = 0;
        }

        accumulator[packageName] += item.firmi;

        return accumulator;
    }, {} as { [packageName: string]: number });

    return Object.entries(activePackages).map(([nazivPaket, firmi]) => ({
        nazivPaket,
        firmi,
    }));
};

const BrojNaAktivniPaketi: React.FC = () => {
    const [data, setData] = useState<BrojNaAktivniPaketiInterface[]>([]);
    const [filteredData, setFilteredData] = useState<BrojNaAktivniPaketiInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/AktivniPaketiPoKompanija`, {
            method: "get",
            headers: new Headers({
                "Access-Control-Allow-Origin": "*",
                "ngrok-skip-browser-warning": "69420",
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Received content is not JSON");
                }
                return response.json();
            })
            .then((data: BrojNaAktivniPaketiInterface[]) => {
                setData(data);
                setFilteredData(data);
                console.log(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const sum: number = filteredData.reduce((accumulator, item) => accumulator + item.firmi, 0);

    const scaledData = filteredData.map((item) => ({
        ...item,
        firmi: (item.firmi / sum) * 100,
    }));

    const transformedData = transformData(scaledData);

    const chartData = {
        labels: transformedData.map((item) => item.nazivPaket),
        datasets: [
            {
                data: transformedData.map((item) => item.firmi),
                backgroundColor: [
                    'rgb(41, 176, 190)',
                    'rgb(41, 176, 190, 0.7)',
                    'rgb(41, 176, 190, 0.4)',
                ],
            }
        ],
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Број на активни пакети</Typography>
            <Box sx={{ height: '535px', width: '535px', marginLeft: 'auto', marginRight: 'auto', marginTop: 0, marginBottom: 0, padding: 0 }}>
                <Pie
                    data={chartData}
                    options={chartOptions}
                />
            </Box>
        </>
    );
};

export default BrojNaAktivniPaketi;
