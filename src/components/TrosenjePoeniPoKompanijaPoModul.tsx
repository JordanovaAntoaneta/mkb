import { useEffect, useState } from "react";
import { TrosenjeNaPoneiPoKompanijaPoModulInterface } from "../interfaces/TrosenjePoeniPoKompanijaPoModulInterface";
import { TrosenjeNaPariIPoeniInterfejs } from "../interfaces/TrosenjeNaPariIPoeniInterfejs";
import { Link } from "./LinkBase";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
        legend: {
            display: false,
            position: 'top',
            labels: {
                color: '#32355c',
            },
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Број на потрошени поени',
            },
        },
        y: {
            title: {
                display: true,
                text: 'Подмодули',
            },
            ticks: {
                autoSkip: false,
                maxRotation: 0,
                font: {
                    size: 9,
                },
                stepSize: 2
            },
        },
    },
};

const TrosenjeNaPariIPoeniPoKompanija: React.FC = () => {
    const [data, setData] = useState<TrosenjeNaPoneiPoKompanijaPoModulInterface[]>([]);
    const [data2, setData2] = useState<TrosenjeNaPariIPoeniInterfejs[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/PotrosheniSredstvaPoKompanija`, {
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
            .then((data: TrosenjeNaPariIPoeniInterfejs[]) => {
                setData2(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/TroseniPoeniPoKompanijaPoModul?embs=${selectedCompany}`, {
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
            .then((data: TrosenjeNaPoneiPoKompanijaPoModulInterface[]) => {
                setData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, [selectedCompany]);

    const chartData = {
        labels: data.map(label => label.nazivPodModul.trim()),
        datasets: [
            {
                label: '',
                data: data.map(entry => entry.totalPointsSpent),
                backgroundColor: 'rgb(41, 176, 190)',
                minBarLength: 5,
            }
        ]
    }

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Потрошени поени по компании по модул</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <Autocomplete
                    disablePortal
                    options={data2.map(quote => `(${quote.embs}) ${quote.companyName}`)}
                    sx={{ width: 600, color: "#32355c !important", borderColor: "#32355c" }}
                    onChange={(event, value) => setSelectedCompany(value ? value.substring(1, 8) : null)}
                    renderInput={(params) => <TextField className='search-company' {...params} label="Пребарај компанија..." />}
                />
            </Box>
            <Bar
                style={{ marginTop: '30px' }}
                data={chartData}
                options={chartOptions}
                height={165}
            />
        </>
    );
}

export default TrosenjeNaPariIPoeniPoKompanija;