import React, { useEffect, useState, useMemo } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { TrosenjeNaPariIPoeniInterfejs } from '../interfaces/TrosenjeNaPariIPoeniInterfejs';
import { Link } from "./LinkBase";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

const transformData = (data: TrosenjeNaPariIPoeniInterfejs[]) => {
    const groupedData = data.reduce((accumulator, item) => {
        const embs = item.embs;
        const kompanija = item.companyName;

        if (!accumulator[embs]) {
            accumulator[embs] = {};
        }

        if (!accumulator[embs][kompanija]) {
            accumulator[embs][kompanija] = { poeni: 0, pari: 0 };
        }

        accumulator[embs][kompanija].pari += item.potroshenoDenari;
        accumulator[embs][kompanija].poeni += item.potrosheniPoeni;

        return accumulator;
    }, {} as { [embs: string]: { [company: string]: { poeni: number, pari: number } } });

    return Object.keys(groupedData).map((embs) => ({
        embs,
        companies: groupedData[embs]
    }));
};

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
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
                display: false,
                text: '',
            },
        },
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                display: true,
                text: 'Поени',
            },
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
                drawOnChartArea: false,
            },
            title: {
                display: true,
                text: 'Денари',
            },
        },
    },
};

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

const ProfitPerCategoryChartBar: React.FC = () => {
    const [data, setData] = useState<TrosenjeNaPariIPoeniInterfejs[]>([]);
    const [filteredData, setFilteredData] = useState<TrosenjeNaPariIPoeniInterfejs[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [showType, setShowType] = useState<string>('default');

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
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const transformedData = useMemo(() => transformData(filteredData), [filteredData]);

    const chartData = useMemo(() => {
        if (!selectedCompany) return { labels: [], datasets: [] };

        const companyData = transformedData.find(group =>
            Object.keys(group.companies).includes(selectedCompany)
        );

        if (!companyData) {
            console.warn(`No data found for company: ${selectedCompany}`);
            return { labels: ["Поени", "Денари"], datasets: [] };
        }

        const companyInfo = companyData.companies[selectedCompany];

        return {
            labels: [selectedCompany],
            datasets: [
                {
                    label: 'Поени',
                    data: [companyInfo.poeni],
                    backgroundColor: "rgb(41, 176, 190)",
                    yAxisID: 'y'
                },
                {
                    label: 'Денари',
                    data: [companyInfo.pari],
                    backgroundColor: "rgb(255, 131, 41)",
                    yAxisID: 'y1'
                }
            ],
        };
    }, [transformedData, selectedCompany]);

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Потрошени пари и поени по компанија</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <Autocomplete
                    disablePortal
                    options={data.map(quote => quote.companyName)}
                    sx={{ width: 300, color: "#32355c !important", borderColor: "#32355c" }}
                    onChange={(event, value) => setSelectedCompany(value)}
                    renderInput={(params) => <TextField className='search-company' {...params} label="Пребарај компанија..." />}
                />
            </Box>
            <Bar
                style={{ marginTop: '30px' }}
                data={chartData}
                options={chartOptions}
            />
        </>
    );
};

export default ProfitPerCategoryChartBar;
