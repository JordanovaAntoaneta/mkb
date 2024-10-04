import { Box, Typography } from "@mui/material";
import { ChartOptions } from "chart.js";
import { Pie } from "react-chartjs-2";
import { KorisniciSoNepotvrdenEmailInterface } from "../interfaces/KorisniciSoNepotvrdenEmailInterface";
import { useEffect, useState } from "react";
import { Link } from "./LinkBase";

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

const KorisniciSoNepotvrdenEmail: React.FC = () => {
    const [data, setData] = useState<KorisniciSoNepotvrdenEmailInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/KorisniciSoNepotvrdenEmail`, {
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
            .then((data: KorisniciSoNepotvrdenEmailInterface[]) => {
                setData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    let brojPravniLica: number = 0, brojFizickiLica: number = 0;

    data.forEach(item => {
        console.log('item', item);
        if (item.isPravnoLice === "YES") {
            brojPravniLica++;
        } else if (item.isPravnoLice === "NO") {
            brojFizickiLica++;
        }
    });

    const sum: number = brojFizickiLica + brojPravniLica;

    const scaledPravni = (brojPravniLica / sum) * 100;
    const scaledFizicki = (brojFizickiLica / sum) * 100;

    const chartData = {
        labels: ['Правно лице', 'Физичко лице'],
        datasets: [
            {
                data: [scaledPravni, scaledFizicki],
                backgroundColor: ['rgb(41, 176, 190)', 'rgb(41, 176, 190, 0.7)'],
            }
        ]
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>
                Корисници со непотврдена електронска пошта
            </Typography>
            <Box sx={{ height: '535px', width: '535px', marginLeft: 'auto', marginRight: 'auto', padding: 0 }}>
                <Pie
                    data={chartData}
                    options={chartOptions}
                    height={200}
                />
            </Box>
        </>
    );
}

export default KorisniciSoNepotvrdenEmail;
