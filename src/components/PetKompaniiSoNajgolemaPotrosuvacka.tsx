import React, { useEffect, useState, useMemo } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions, Tick } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
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
            accumulator[embs][kompanija] = { поени: 0, пари: 0 };
        }

        accumulator[embs][kompanija].пари += item.potroshenoDenari;
        accumulator[embs][kompanija].поени += item.potrosheniPoeni;

        return accumulator;
    }, {} as { [embs: string]: { [company: string]: { поени: number, пари: number } } });

    return Object.keys(groupedData).map((embs) => ({
        embs,
        companies: groupedData[embs]
    }));
};

function findSecondUpper(str: string) {
    let res: any;
    let flag = true;
    let alphabet = ['А', 'Б', 'В', 'Г', 'Д', 'Ѓ', 'Е', 'Ж', 'З', 'Ѕ', 'И', 'Ј', 'К', 'Л', 'Љ', 'М', 'Н', 'Њ', 'О', 'П', 'Р', 'С', 'Т', 'Ќ', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Џ', 'Ш'];
    for (var i = 0; i < str.length; ++i) {
        if (flag === true) {
            flag = false;
        } else {
            if (alphabet.includes(str[i])) {
                res = i;
                break;
            }
        }
    }
    return res;
}

const chartOptionsSortGraph: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const showType = context.dataset.label;
                    if (showType === 'Поени') {
                        return `${context.dataset.data[context.dataIndex]} поени`;
                    } else {
                        return `${context.dataset.data[context.dataIndex]} денари`;
                    }
                },
            }
        },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Компании',
            },
            ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
                font: {
                    size: 9,
                },
                callback: function (tickValue, index, ticks) {
                    let arr = new Array();
                    let indeks: number;
                    let str: string;
                    ticks.forEach((tick: any) => {
                        if (tick.value === tickValue) {
                            let label = this.getLabelForValue(tick.value);
                            if (label.toString().length > 35) {
                                indeks = findSecondUpper(label);
                                let res = '...' + label.substring(indeks, indeks + 22) + '...';
                                arr.push(res);
                            }
                        }

                    });
                    return arr;
                },
            },
        },
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                display: true,
                text: 'Количина на потрошени средства',
            },
            ticks: {

            }
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

    const chartDataSortGraph = useMemo(() => {
        if (!showType) return { labels: [], datasets: [] };

        let sortedCompanies: { name: string, embs: string, value: number }[] = [];

        transformedData.forEach(group => {
            const companies = Object.keys(group.companies).map(companyName => ({
                name: companyName,
                embs: group.embs,
                value: showType === 'Поени' ? group.companies[companyName].поени : group.companies[companyName].пари
            }));
            sortedCompanies.push(...companies);
        });

        sortedCompanies.sort((a, b) => b.value - a.value);
        const topCompanies = sortedCompanies.slice(0, 5);

        const labels = topCompanies.map(company => `${company.name} (${company.embs})`);
        const data = topCompanies.map(company => company.value);

        if (showType !== 'default') {
            return {
                labels: labels,
                datasets: [
                    {
                        label: showType,
                        data: data,
                        backgroundColor: showType === "Поени" ? "rgb(41, 176, 190)" : "rgb(255, 131, 41)",
                    },
                ],
            };
        } else {
            return {
                labels: [],
                datasets: [],
            };
        }

    }, [showType, transformedData]);

    const handleSetType = (type: string) => {
        setShowType(type);
    };


    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Пет компании со најголема количина на потрошени средства</Typography>
            <FormControl>
                <Select
                    className='select'
                    onChange={(event) => handleSetType(event.target.value)}
                    value={showType}
                    sx={{ color: "#32355c", borderColor: "#32355c" }}
                >
                    <MenuItem value="default" disabled>Избери тип на средства</MenuItem>
                    <MenuItem value="Поени" sx={{ color: "#32355c", borderColor: "#32355c" }}>Поени</MenuItem>
                    <MenuItem value="Пари" sx={{ color: "#32355c", borderColor: "#32355c" }}>Пари</MenuItem>
                </Select>
            </FormControl>
            <Bar
                style={{ marginTop: '30px' }}
                data={chartDataSortGraph}
                typeof='horizontalBar'
                options={chartOptionsSortGraph}
            />
        </>
    );
};

export default ProfitPerCategoryChartBar;

